// routes/pago/pagos.rutas.js
const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const subirArchivo = require('../../s3/subirArchivo');

// ─────────── Función auxiliar para sumar un período a una fecha ───────────
function agregarPeriodo(fechaBase, tiempoPago) {
  const f = new Date(fechaBase);
  switch (tiempoPago.toLowerCase()) {
    case 'mensual':
      f.setMonth(f.getMonth() + 1);
      break;
    case 'trimestral':
      f.setMonth(f.getMonth() + 3);
      break;
    case 'anual':
      f.setFullYear(f.getFullYear() + 1);
      break;
    default:
      break;
  }
  return f;
}

// ─────────── Configuración de Multer para subir el archivo ───────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/pagos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único: timestamp + nombre original (sin espacios)
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '');
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/**
 * ▶︎ POST /pagos
 *
 * - Body (form-data):
 *     • archivo (file)                → comprobante (PDF u otro)
 *     • cantidad (texto)              → monto del pago
 *     • id_usuario_seguro_per (texto) → id de usuario_seguro (int)
 *     • usuario (texto)               → nombre de carpeta en S3
 *
 * Flujo:
 *  1) Verificamos que el contrato exista y esté activo.
 *  2) Sacamos la última fecha de pago (si existe) o dejamos null.
 *  3) Si no hay ningún pago previo (primera vez), aceptamos directamente.
 *  4) Si hay al menos un pago previo, calculamos “próxima fecha” = última_fecha + periodo.
 *     • si hoy < próxima, rechazamos con “Aún no toca pagar”.
 *     • si hoy ≥ próxima, revisamos que no exista otro pago para este mismo período.
 *  5) Si pasa las validaciones, subimos a S3, guardamos en BD y actualizamos estado_pago = 1.
 */
router.post('/', upload.single('archivo'), async (req, res) => {
  const file = req.file;
  const { cantidad, id_usuario_seguro_per, usuario } = req.body;

  if (!file || !cantidad || !id_usuario_seguro_per) {
    return res.status(400).json({
      error: 'Faltan datos requeridos (archivo, cantidad y id_usuario_seguro_per)'
    });
  }

  // 1) Verificar que el contrato exista y esté activo (estado = 1)
  const sqlContrato = `
    SELECT fecha_contrato, modalidad_pago, estado_pago
    FROM usuario_seguro
    WHERE id_usuario_seguro = ? AND estado = 1
  `;
  db.query(sqlContrato, [id_usuario_seguro_per], (err1, contratos) => {
  if (err1) {
    console.error('[POST /pagos] Error al consultar usuario_seguro:', err1);
    return res.status(500).json({ error: 'Error interno al verificar contrato' });
  }
  if (contratos.length === 0) {
    return res.status(404).json({ error: 'Contrato no existe o no está activo' });
  }

  const { fecha_contrato, modalidad_pago, estado_pago } = contratos[0];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // ✅ Aquí es válido y seguro verificar el estado_pago
  if (estado_pago === 0) {
    return procesarPagoNormal();
  }

    // 2) Obtener la última fecha de pago (si existe)
    const sqlUltPago = `
      SELECT MAX(fecha_pago) AS ultima_fecha
      FROM pago_seguro
      WHERE id_usuario_seguro_per = ?
    `;
    db.query(sqlUltPago, [id_usuario_seguro_per], (err2, rowsPago) => {
      if (err2) {
        console.error('[POST /pagos] Error al consultar último pago:', err2);
        return res.status(500).json({ error: 'Error interno al verificar pagos previos' });
      }

      const ultimaFecha = rowsPago[0].ultima_fecha; // puede ser null

      // 3) Si NO hay ningún pago previo, procesamos este como el primer pago
      if (!ultimaFecha) {
        return procesarPrimerPago();
      }

      // 4) Si ya hay al menos un pago, validamos el período
      let fechaReferencia = ultimaFecha;
      const proxVencimiento = agregarPeriodo(fechaReferencia, modalidad_pago);
      proxVencimiento.setHours(0, 0, 0, 0);

      if (hoy < proxVencimiento) {
        // Aún no toca pagar
        const yyyy = proxVencimiento.getFullYear();
        const mm = String(proxVencimiento.getMonth() + 1).padStart(2, '0');
        const dd = String(proxVencimiento.getDate()).padStart(2, '0');
        return res.status(400).json({
          error: `Aún no toca pagar. El próximo vencimiento es el ${yyyy}-${mm}-${dd}.`
        });
      }

      // 5) Verificar que no exista un pago en el mismo período
      const yyyy2 = proxVencimiento.getFullYear();
      const mm2 = String(proxVencimiento.getMonth() + 1).padStart(2, '0');
      const dd2 = String(proxVencimiento.getDate()).padStart(2, '0');
      const fechaVencStr = `${yyyy2}-${mm2}-${dd2}`; // 'YYYY-MM-DD'

      const sqlPagoMismoPeriodo = `
        SELECT COUNT(*) AS cuenta 
        FROM pago_seguro
        WHERE id_usuario_seguro_per = ? 
          AND fecha_pago >= ?
      `;
      db.query(sqlPagoMismoPeriodo, [id_usuario_seguro_per, fechaVencStr], async (err3, rowsCnt) => {
        if (err3) {
          console.error('[POST /pagos] Error al verificar pago en período:', err3);
          return res.status(500).json({ error: 'Error interno al verificar pago del período' });
        }

        if (rowsCnt[0].cuenta > 0) {
          return res.status(400).json({ error: 'Ya existe un pago registrado para este período.' });
        }

        // 6) Si pasa todas las validaciones, procesamos un pago "normal" (no es el primero)
        return procesarPagoNormal();
      });
    }); // Fin SELECT MAX(fecha_pago)

    /**
     * Función para procesar el PRIMER pago sin validación de fechas.
     * Sube el archivo a S3, lo inserta en pago_seguro y marca estado_pago = 1.
     */
    async function procesarPrimerPago() {
      try {
        // Si 'usuario' llega undefined, usamos 'sin-usuario' como carpeta por defecto
        const carpeta = usuario || 'sin-usuario';

        // 6.1) Subir a S3
        const uniqueName = file.filename;
        const rutaS3 = `${carpeta}/${uniqueName}`;
        await subirArchivo(file.path, rutaS3);

        // 6.2) Borrar el archivo temporal
        fs.unlinkSync(file.path);

        // 6.3) Construir URL en S3
        const urlS3 = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${rutaS3}`;

        // 6.4) Insertar en pago_seguro
        const sqlInsertPago = `
          INSERT INTO pago_seguro 
            (id_usuario_seguro_per, fecha_pago, cantidad, comprobante_pago)
          VALUES (?, CURDATE(), ?, ?)
        `;
        db.query(sqlInsertPago, [id_usuario_seguro_per, cantidad, urlS3], (err4) => {
          if (err4) {
            console.error('[POST /pagos] Error al insertar primer pago:', err4);
            return res.status(500).json({ error: 'Error al guardar el pago en la base de datos' });
          }

          return res.json({ message: 'Primer pago guardado exitosamente. En espera de revisión.' });
        });
      } catch (errorS3) {
        console.error('[POST /pagos] Error S3/Pago (primer):', errorS3);
        return res.status(500).json({ error: 'Error interno al subir el comprobante a S3' });
      }
    }

    /**
     * Función para procesar pagos posteriores al primero (validación de fechas ya hecha).
     * Sube el archivo a S3, lo inserta en pago_seguro y marca estado_pago = 1.
     */
    async function procesarPagoNormal() {
      try {
        // Si 'usuario' llega undefined, usamos 'sin-usuario' como carpeta por defecto
        const carpeta = usuario || 'sin-usuario';

        // 6.1) Subir a S3
        const uniqueName = file.filename;
        const rutaS3 = `${carpeta}/${uniqueName}`;
        await subirArchivo(file.path, rutaS3);

        // 6.2) Borrar el archivo temporal
        fs.unlinkSync(file.path);

        // 6.3) Construir URL en S3
        const urlS3 = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${rutaS3}`;

        // 6.4) Insertar en pago_seguro
        const sqlInsertPago = `
          INSERT INTO pago_seguro 
            (id_usuario_seguro_per, fecha_pago, cantidad, comprobante_pago)
          VALUES (?, CURDATE(), ?, ?)
        `;
        db.query(sqlInsertPago, [id_usuario_seguro_per, cantidad, urlS3], (err4) => {
          if (err4) {
            console.error('[POST /pagos] Error al insertar pago:', err4);
            return res.status(500).json({ error: 'Error al guardar el pago en la base de datos' });
          }

          // 6.5) Actualizar estado_pago = 1 en usuario_seguro
          return res.json({ message: 'Pago guardado exitosamente. En espera de revisión.' });
        });
      } catch (errorS3) {
        console.error('[POST /pagos] Error S3/Pago:', errorS3);
        return res.status(500).json({ error: 'Error interno al subir el comprobante a S3' });
      }
    }
  });
});

/**
 * ▶︎ GET /pagos/cliente/:id_usuario_per
 * 
 * Devuelve todo el historial de pagos de TODOS los contratos activos de un usuario.
 */
router.get('/cliente/:id_usuario_per', (req, res) => {
  const { id_usuario_per } = req.params;

  // Validar que venga un número
  if (!id_usuario_per || isNaN(parseInt(id_usuario_per, 10))) {
    return res.status(400).json({ error: 'ID de usuario no válido' });
  }

  const sqlHistorial = `
    SELECT 
      ps.id_pago_seguro,
      ps.id_usuario_seguro_per,
      ps.fecha_pago,
      ps.cantidad,
      ps.comprobante_pago,
      s.nombre AS nombre_seguro,
      us.fecha_contrato,
      us.modalidad_pago
    FROM pago_seguro ps
    JOIN usuario_seguro us 
      ON ps.id_usuario_seguro_per = us.id_usuario_seguro
    JOIN seguro s 
      ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_per = ?
      AND us.estado = 1
    ORDER BY ps.fecha_pago DESC
  `;
  db.query(sqlHistorial, [id_usuario_per], (err, rows) => {
    if (err) {
      console.error(`[GET /pagos/cliente/${id_usuario_per}] Error al obtener historial:`, err);
      return res.status(500).json({ error: 'Error interno al obtener historial de pagos' });
    }
    // Si no hay filas, devolvemos array vacío
    return res.json(rows);
  });
});

/**
 * ▶︎ GET /pagos/contrato/:id_usuario_seguro
 * Devuelve los pagos asociados únicamente a ese contrato.
 */
// GET pagos por contrato
router.get('/contrato/:id_usuario_seguro', (req, res) => {
  const { id_usuario_seguro } = req.params;

  const sql = `
    SELECT 
      ps.id_pago_seguro,
      ps.fecha_pago,
      ps.cantidad,
      ps.comprobante_pago,
      s.nombre AS nombre_seguro,
      CASE 
  WHEN ps.id_pago_seguro = (
    SELECT MAX(id_pago_seguro)
    FROM pago_seguro
    WHERE id_usuario_seguro_per = ?
  ) THEN us.estado_pago
  ELSE NULL
END AS estado_pago
    FROM pago_seguro ps
    JOIN usuario_seguro us ON ps.id_usuario_seguro_per = us.id_usuario_seguro
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_seguro = ?
    ORDER BY ps.fecha_pago DESC
  `;

  db.query(sql, [id_usuario_seguro, id_usuario_seguro], (err, rows) => {
    if (err) {
      console.error(`[GET /pagos/contrato/${id_usuario_seguro}] Error:`, err);
      return res.status(500).json({ error: 'Error interno al obtener pagos del contrato' });
    }
    res.json(rows);
  });
});



// Confirmar un pago
router.patch('/:id/confirmar', (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE usuario_seguro
    SET estado_pago = 1
    WHERE id_usuario_seguro = (
      SELECT id_usuario_seguro_per FROM pago_seguro WHERE id_pago_seguro = ?
    )
  `;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).send('Error al confirmar pago');
    res.status(200).json({ message: 'Pago confirmado correctamente' });
  });
});

// Denegar un pago
router.patch('/:id/denegar', (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE usuario_seguro
    SET estado_pago = 0
    WHERE id_usuario_seguro = (
      SELECT id_usuario_seguro_per FROM pago_seguro WHERE id_pago_seguro = ?
    )
  `;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).send('Error al cancelar pago');
    res.status(200).json({ message: 'Pago cancelado correctamente' });
  });
});

// Ruta para obtener la URL de un comprobante de pago
router.get('/descarga/:id_pago_seguro', (req, res) => {
  const { id_pago_seguro } = req.params;

  if (!id_pago_seguro || isNaN(parseInt(id_pago_seguro, 10))) {
    return res.status(400).json({ error: 'ID de pago inválido' });
  }

  const sql = `
    SELECT comprobante_pago
    FROM pago_seguro
    WHERE id_pago_seguro = ?
  `;

  db.query(sql, [id_pago_seguro], async (err, rows) => {
    if (err) {
      console.error(`[GET /pagos/descarga/${id_pago_seguro}] Error al consultar base de datos:`, err);
      return res.status(500).json({ error: 'Error interno al obtener el comprobante' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const comprobante = rows[0].comprobante_pago;

    // Si ya es una URL completa, la devolvemos directo
    if (comprobante.startsWith('http')) {
      return res.json({ url: comprobante });
    }

    try {
      let key = comprobante.trim();
      if (key.startsWith('undefined/')) {
        key = key.replace('undefined/', '');
      }

      console.log("Key solicitada a S3:", key);

      const url = await obtenerUrlArchivo(key);
      return res.json({ url });
    } catch (err2) {
      console.error(`[GET /pagos/descarga/${id_pago_seguro}] Error al generar URL firmada:`, err2);
      return res.status(500).json({ error: 'No se pudo generar la URL del comprobante' });
    }
  });
});


module.exports = router;
