// routes/reembolso/reembolso.rutas.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../../db/connection');
const subirArchivoS3 = require('../../s3/subirArchivo');   // import correcto
const obtenerUrlArchivo = require('../../s3/obtenerUrl'); // sólo si lo usas más abajo

// setup Multer para carpeta temporal
const tmpDir = path.join(__dirname, '../../uploads/reembolsos');
fs.mkdirSync(tmpDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'')}`)
});
const upload = multer({ storage });

// 1) Ruta GET /reembolsos/pendientes
router.get('/pendientes', (req, res) => {
  const sql = `
    SELECT
      r.id_reembolso,
      u.nombre    AS nombre_cliente,
      u.apellido  AS apellido_cliente,
      s.nombre    AS nombre_seguro,
      r.motivo,
      r.monto_solicitado AS monto,
      DATE_FORMAT(r.fecha_solicitud, '%Y-%m-%d') AS fecha_solicitud
    FROM reembolso r
    JOIN usuario_seguro us ON r.id_usuario_seguro = us.id_usuario_seguro
    JOIN usuario u         ON us.id_usuario_per    = u.id_usuario
    JOIN seguro s          ON us.id_seguro_per     = s.id_seguro
    WHERE r.estado = 'PENDIENTE'
    ORDER BY r.fecha_solicitud DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error al obtener pendientes:', err);
      return res.status(500).send('Error interno');
    }
    res.json(rows);
  });
});

// 1) Ruta para devolver la URL firmada de S3 de un documento
router.get('/:id/documento/:docId', async (req, res) => {
  const { id, docId } = req.params;
  // 1.1) Busca la key en BD
  const sql = `
    SELECT path_archivo 
      FROM documento_reembolso 
     WHERE id_reembolso = ? 
       AND id_documento = ?
  `;
  db.query(sql, [id, docId], async (err, rows) => {
    if (err) {
      console.error('Error al consultar documento:', err);
      return res.status(500).send('Error interno');
    }
    if (!rows.length) {
      return res.status(404).send('Documento no encontrado');
    }
    try {
      // 1.2) Usas tu helper para generar el presigned URL
      const url = await obtenerUrlArchivo(rows[0].path_archivo);
      // 1.3) Devuelves JSON con { url }
      res.json({ url });
    } catch (e) {
      console.error('Error generando URL:', e);
      res.status(500).send('No se pudo generar URL');
    }
  });
});

// GET /reembolsos/pendiente/:id_usuario_seguro
router.get('/pendiente/:id_usuario_seguro', (req, res) => {
  const { id_usuario_seguro } = req.params;
  const sql = `
    SELECT COUNT(*) AS cnt
      FROM reembolso
     WHERE id_usuario_seguro = ?
       AND estado = 'PENDIENTE'
  `;
  db.query(sql, [id_usuario_seguro], (err, rows) => {
    if (err) {
      console.error('Error al chequear pendientes:', err);
      return res.status(500).send('Error interno');
    }
    // devolvemos { pendiente: true|false }
    res.json({ pendiente: rows[0].cnt > 0 });
  });
});


router.post('/', upload.any(), async (req, res) => {
  try {
    const { id_usuario_seguro, motivo, monto } = req.body;
    // 1) Inserta el reembolso y captura el insertId
    const fecha = new Date();
    const fechaSQL = fecha.toISOString().slice(0,10);
    const horaSQL  = fecha.toTimeString().slice(0,8);
    const insertResult = await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO reembolso
           (id_usuario_seguro, fecha_solicitud, hora_solicitud, motivo, monto_solicitado)
         VALUES (?, ?, ?, ?, ?)`,
        [id_usuario_seguro, fechaSQL, horaSQL, motivo, monto],
        (err, result) => err ? reject(err) : resolve(result)
      );
    });
    const idReembolso = insertResult.insertId;

    // 2) Sube cada archivo a S3 y guarda su key en BD
    await Promise.all(req.files.map(async file => {
      const carpeta = `reembolsos_${id_usuario_seguro}`;
      // Llama al helper que SI tienes importado:
      await subirArchivoS3(file.path, file.filename, carpeta);
      // Limpia el tmp
      fs.unlinkSync(file.path);
      // Inserta el registro de documento
      const keyS3 = `${carpeta}/${file.filename}`;
    // Corregir mojibake: reinterpretar nombre en latin1 como UTF-8
    const original = file.originalname;
    const nombre_utf8 = Buffer.from(original, 'latin1').toString('utf8');
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO documento_reembolso
             (id_reembolso, nombre_archivo, path_archivo)
           VALUES (?, ?, ?)`,
          [idReembolso, nombre_utf8, keyS3],
          err2 => err2 ? reject(err2) : resolve()
        );
      });
    }));

    return res.status(201).json({ ok: true, idReembolso });
  } catch (err) {
    console.error('Error en POST /reembolsos:', err);
    return res.status(500).send('Error al procesar reembolso');
  }
});

// 2) Detalle de una única solicitud
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // 1) Traigo datos de cabecera
  const sqlCab = `
    SELECT
      r.id_reembolso,
      u.nombre    AS cliente,
      u.apellido  AS apellido,
      s.nombre    AS seguro,
      r.motivo,
      r.monto_solicitado AS monto_solicitado,
      DATE_FORMAT(r.fecha_solicitud, '%Y-%m-%d') AS fecha_solicitud,
      DATE_FORMAT(r.hora_solicitud, '%H:%i:%s')    AS hora_solicitud
    FROM reembolso r
    JOIN usuario_seguro us ON r.id_usuario_seguro = us.id_usuario_seguro
    JOIN usuario        u  ON us.id_usuario_per    = u.id_usuario
    JOIN seguro         s  ON us.id_seguro_per     = s.id_seguro
    WHERE r.id_reembolso = ?
  `;
  db.query(sqlCab, [id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al obtener detalle');
    }
    if (!rows.length) {
      return res.status(404).send('Reembolso no encontrado');
    }
    const detalle = rows[0];
    // 2) Traigo sus documentos
    const sqlDocs = `
      SELECT id_documento, nombre_archivo
      FROM documento_reembolso
      WHERE id_reembolso = ?
    `;
    db.query(sqlDocs, [id], (err2, docs) => {
      if (err2) {
        console.error(err2);
        return res.status(500).send('Error al obtener documentos');
      }
      detalle.documentos = docs;           // inserto array bajo detalle
      res.json(detalle);
    });
  });
});



// --- RECHAZAR REEMBOLSO (con motivo + crear notificación)
router.put('/:id/rechazar', (req, res) => {
  const { id } = req.params;
  const { motivo_rechazo } = req.body;
  // 1) Marco como rechazado y guardo el motivo
  db.query(
    `UPDATE reembolso 
        SET estado = 'RECHAZADO', motivo_rechazo = ?
      WHERE id_reembolso = ?`,
    [motivo_rechazo, id],
    err => {
      if (err) return res.status(500).send('Error al rechazar');
      // 2) Recupero el usuario para notificarle
      const sqlUser = `
        SELECT us.id_usuario_per AS id_usuario
        FROM reembolso r
        JOIN usuario_seguro us ON r.id_usuario_seguro = us.id_usuario_seguro
        WHERE r.id_reembolso = ?
      `;
      db.query(sqlUser, [id], (e2, rows) => {
        if (e2 || !rows.length) {
          console.error('No se pudo encontrar usuario para notificar');
          return res.json({ ok: true });
        }
        const idUsuario = rows[0].id_usuario;
        // 3) Inserto en tabla notificacion
        const texto = `Tu solicitud de reembolso #${id} fue rechazada: ${motivo_rechazo}`;
        db.query(
          `INSERT INTO notificacion (id_usuario, mensaje, fecha) 
             VALUES (?, ?, NOW())`,
          [idUsuario, texto],
          e3 => {
            if (e3) console.error('Error al crear notificación', e3);
            // finalmente
            res.json({ ok: true });
          }
        );
      });
    }
  );
});

// al final, antes de `module.exports = router;`
router.get('/usuario/:id', (req, res) => {
  const idUsuario = req.params.id;
  const sql = `
    SELECT 
      r.id_reembolso,
      s.nombre            AS seguro,
      r.fecha_solicitud    AS fecha,
      r.monto_solicitado   AS monto,
      r.estado
    FROM reembolso r
    JOIN usuario_seguro us ON r.id_usuario_seguro = us.id_usuario_seguro
    JOIN seguro s         ON us.id_seguro_per     = s.id_seguro  -- nuevo
    WHERE us.id_usuario_per = ?
    ORDER BY r.fecha_solicitud DESC
  `;
  db.query(sql, [idUsuario], (err, rows) => {
    if (err) {
      console.error('Error al obtener historial de reembolsos:', err);
      return res.status(500).send('Error interno');
    }
    res.json(rows);
  });
});

// Quedará así:
router.put('/:id/aprobar', (req, res) => {
  const { id } = req.params;
  // 1) Marco como aprobado
  db.query(
    `UPDATE reembolso SET estado = 'DEVUELTO' WHERE id_reembolso = ?`,
    [id],
    (err) => {
      if (err) return res.status(500).send('Error al aprobar');
      // 2) Recupero el usuario para notificarle
      const sqlUser = `
        SELECT us.id_usuario_per AS id_usuario
          FROM reembolso r
          JOIN usuario_seguro us ON r.id_usuario_seguro = us.id_usuario_seguro
         WHERE r.id_reembolso = ?
      `;
      db.query(sqlUser, [id], (e2, rows) => {
        if (e2 || !rows.length) {
          console.error('No se encontró usuario para notificar');
          return res.json({ ok: true });
        }
        const idUsuario = rows[0].id_usuario;
        // 3) Inserto la notificación de aprobación
        const texto = `¡Tu reembolso #${id} ha sido aprobado con éxito!`;
        db.query(
          `INSERT INTO notificacion (id_usuario, mensaje, fecha)
             VALUES (?, ?, NOW())`,
          [idUsuario, texto],
          (e3) => {
            if (e3) console.error('Error creando notificación de aprobación', e3);
            res.json({ ok: true });
          }
        );
      });
    }
  );
});

module.exports = router;
