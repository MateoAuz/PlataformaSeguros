const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const subirArchivo = require('../../s3/subirArchivo');
const obtenerUrlArchivo = require('../../s3/obtenerUrl');

// --- Configuración de subida de archivos (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Carpeta uploads/contratos dentro de tu proyecto
    const dir = path.join(__dirname, '..', 'uploads', 'contratos');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Nombre único basado en timestamp + nombre original (sin espacios)
    const nombreUnico = Date.now() + '-' + file.originalname.replace(/\s+/g, '');
    cb(null, nombreUnico);
  }
});
const upload = multer({ storage });

// --- Helper para obtener un path relativo “seguro” desde uploads/
const uploadsFolder = path.join(process.cwd(), 'uploads');
function getRelativePath(fullPath) {
  // Convierte algo como "C:\...project\uploads\contratos\1234-archivo.pdf"
  // a "uploads/contratos/1234-archivo.pdf"
  let rel = path.relative(uploadsFolder, fullPath).replace(/\\/g, '/');
  return `uploads/${rel}`;
}

// --- Función auxiliar para sumar un período (Mensual/Trimestral/Anual)
function agregarPeriodo(fechaBase, tiempoPago) {
  const f = (fechaBase instanceof Date) ? new Date(fechaBase) : new Date(fechaBase);
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

// --- CREAR CONTRATO (CON FIRMA Y REQUISITOS)
router.post('/', upload.any(), async (req, res) => {
  try {
    const { id_usuario, id_seguro, modalidad_pago } = req.body;
    if (!id_usuario || !id_seguro || !modalidad_pago) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    // Extraer archivos de firma y “documentos[...]”
    let firmaArchivo = null;
    const documentos = {}; // { idRequisito: { path, originalName } }

    for (const file of req.files) {
      if (file.fieldname === 'firma_pdf') {
        firmaArchivo = file;
      } else if (file.fieldname.startsWith('documentos[')) {
        const idRequisito = file.fieldname.match(/documentos\[(\d+)\]/)[1];
        const carpetaUsuario = `usuario_${id_usuario}`;
        const nombreUnico = `${Date.now()}-${file.originalname.replace(/\s+/g, '')}`;

        await subirArchivo(file.path, nombreUnico, carpetaUsuario);
        fs.unlinkSync(file.path); // elimina el archivo temporal
        const keyS3 = `${carpetaUsuario}/${nombreUnico}`;

        documentos[idRequisito] = {
          path: keyS3,
          originalName: file.originalname
        };
      }
    }


    // Path relativo para guardar en BD
    const firmaBD = firmaArchivo ? getRelativePath(firmaArchivo.path) : null;


    // Fecha actual en formato “YYYY-MM-DD” y hora “HH:MM:SS”
    const fecha = new Date();
    const yyyyMMdd = fecha.getFullYear() + '-' +
      String(fecha.getMonth() + 1).padStart(2, '0') + '-' +
      String(fecha.getDate()).padStart(2, '0');
    const hhmmss = fecha.toTimeString().split(' ')[0];

    // Insertar en usuario_seguro
    const sqlContrato = `
      INSERT INTO usuario_seguro
        (id_usuario_per, id_seguro_per, fecha_contrato, estado, modalidad_pago, firma, hora)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sqlContrato,
      [id_usuario, id_seguro, yyyyMMdd, 0, modalidad_pago, firmaBD, hhmmss],
      async function (err, result) {
        if (err) {
          console.error('❌ Error al insertar contrato:', err);
          return res.status(500).send('Error al guardar el contrato');
        }
        const id_usuario_seguro = result.insertId;

        // Guardar los documentos de requisitos (si existen)
        const inserts = []; // matriz de [id_usuario_seguro, id_requisito, nombre_archivo, path_archivo, validado]
        const eliminarSQL = `
  DELETE FROM usuario_requisito
  WHERE id_usuario_seguro = ? AND id_requisito = ?
`;

        await Promise.all(Object.keys(documentos).map(idReq => {
          return new Promise((resolve, reject) => {
            db.query(eliminarSQL, [id_usuario_seguro, idReq], (err) => {
              if (err) {
                console.error(`❌ Error al eliminar requisito anterior (id: ${idReq})`, err);
                return reject(err);
              }
              resolve();
            });
          });
        }));
        Object.entries(documentos).forEach(([idRequisito, fileObj]) => {
          inserts.push([
            id_usuario_seguro,
            idRequisito,
            fileObj.originalName,
            fileObj.path,
            0
          ]);
        });

        if (inserts.length) {
          const sqlDoc = `
            INSERT INTO usuario_requisito
              (id_usuario_seguro, id_requisito, nombre_archivo, path_archivo, validado)
            VALUES ?
          `;
          db.query(sqlDoc, [inserts], (errDoc) => {
            if (errDoc) {
              console.error('❌ Error al insertar documentos requisitos:', errDoc);
              // No detenemos el flujo: ya insertamos el contrato principal
            }
          });
        }

        // Guardar beneficiarios si vienen en el body
        if (req.body.beneficiarios) {
          try {
            const beneficiariosArray = Object.values(req.body.beneficiarios).map(item =>
              JSON.parse(item)
            );
            if (beneficiariosArray.length > 0) {
              const insertBeneficiarios = beneficiariosArray.map(b => [
                id_usuario_seguro,
                b.nombre,
                b.cedula,
                b.parentesco,
                b.nacimiento?.split('T')[0] || null
              ]);
              const sqlBene = `
                INSERT INTO beneficiario
                  (id_usuario_seguro, nombre, cedula, parentesco, fecha_nacimiento)
                VALUES ?
              `;
              db.query(sqlBene, [insertBeneficiarios], (errB) => {
                if (errB) {
                  console.error('❌ Error al insertar beneficiarios:', errB);
                }
              });
            }
          } catch (errParse) {
            console.error('❌ Error al procesar beneficiarios:', errParse);
          }
        }

        // Todo OK, devolvemos JSON con id del contrato creado
        res.status(201).json({ id: id_usuario_seguro, ok: true });
      }
    );
  } catch (err) {
    console.error('❌ Error interno al registrar el contrato:', err);
    res.status(500).send('Error interno al registrar el contrato');
  }
});

// --- SOLICITUDES PENDIENTES (PARA AGENTE)
router.get('/pendientes', (req, res) => {
  const sql = `
SELECT
      us.id_usuario_seguro,
      u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario,
      s.nombre AS nombre_seguro,
      s.tipo,
      s.tiempo_pago,
      us.fecha_contrato
    FROM usuario_seguro us
    JOIN usuario u ON us.id_usuario_per = u.id_usuario
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.estado = 0
    ORDER BY us.fecha_contrato DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitudes pendientes:', err);
      return res.status(500).send('Error al obtener solicitudes pendientes');
    }
    res.json(results);
  });
});

// --- APROBAR CONTRATO (PUT /aprobar/:id)
router.put('/aprobar/:id', (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE usuario_seguro SET estado = 1 WHERE id_usuario_seguro = ?`;
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('❌ Error al aprobar contrato:', err);
      return res.status(500).send('Error al aprobar contrato');
    }
    res.json({ ok: true });
  });
});

// --- RECHAZAR CONTRATO (PUT /rechazar/:id)
router.put('/rechazar/:id', (req, res) => {
  const { id } = req.params;
  const { motivo_rechazo } = req.body;

  // 1) Marco como rechazado
  const sqlUpd = `UPDATE usuario_seguro SET estado = 3, motivo_rechazo = ? WHERE id_usuario_seguro = ?`;
  db.query(sqlUpd, [motivo_rechazo, id], err => {
    if (err) return res.status(500).json({ mensaje: 'Error al rechazar contrato' });

    // 2) Recupero usuario (para notificarle)
    const sqlUser = `
      SELECT us.id_usuario_per AS id_usuario
      FROM usuario_seguro us
      WHERE us.id_usuario_seguro = ?
    `;
    db.query(sqlUser, [id], (e2, rows) => {
      if (e2 || !rows.length) {
        console.error('No se pudo encontrar usuario para notificar');
        return res.json({ ok: true });
      }
      const idUsuario = rows[0].id_usuario;

      // 3) Recupero el nombre del seguro
      const sqlSeguro = `
        SELECT s.nombre AS seguro_nombre
        FROM usuario_seguro us
        JOIN seguro s ON us.id_seguro_per = s.id_seguro
        WHERE us.id_usuario_seguro = ?
      `;
      db.query(sqlSeguro, [id], (e3, sr) => {
        const nombreSeguro = (e3 || !sr.length)
          ? `#${id}`
          : sr[0].seguro_nombre;

        // 4) Inserto la notificación con el nombre en el texto
        const texto = `Tu solicitud de contrato "${nombreSeguro}" fue rechazada: ${motivo_rechazo}`;
        db.query(
          `INSERT INTO notificacion (id_usuario, mensaje, fecha) VALUES (?, ?, NOW())`,
          [idUsuario, texto],
          e4 => {
            if (e4) console.error('Error al crear notificación', e4);
            res.json({ ok: true });
          }
        );
      });
    });
  });
});



// --- Obtener todos los contratos ACEPTADOS (estado = 1)
router.get('/aceptados', (req, res) => {
  const sql = `
    SELECT
  us.id_usuario_seguro,
+ us.id_usuario_per,
  u.nombre AS nombre_usuario,
  u.apellido AS apellido_usuario,
  s.nombre AS nombre_seguro,
  s.tipo,
  us.fecha_contrato,
  us.modalidad_pago
    FROM usuario_seguro us
    JOIN usuario u ON us.id_usuario_per = u.id_usuario
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.estado = 1
    ORDER BY us.fecha_contrato DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener contratos aceptados:', err);
      return res.status(500).json({ error: 'Error al obtener contratos aceptados' });
    }
    res.json(results);
  });
});

// --- Obtener contratos de un USUARIO específico (para listado general)
router.get('/usuario/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      us.*,
      s.nombre,
      s.tipo,
      s.precio,
      (
        SELECT MAX(fecha_pago)
        FROM pago_seguro ps
        WHERE ps.id_usuario_seguro_per = us.id_usuario_seguro
      ) AS fecha_pago
    FROM usuario_seguro us
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_per = ?
    ORDER BY us.fecha_contrato DESC
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener contratos del usuario:', err);
      return res.status(500).json({ error: 'Error al obtener contratos' });
    }
    res.json(results);
  });
});

// --- DETALLE SIMPLE DE UN CONTRATO
router.get('/detalle-simple/:id', (req, res) => {
  const { id } = req.params;
  const sqlContrato = `
    SELECT
      us.id_usuario_seguro,
      u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario,
      s.nombre AS nombre_seguro,
      s.tipo,
      s.precio,
      s.tiempo_pago AS modalidad_pago,
      s.cobertura,
      us.firma
    FROM usuario_seguro us
    JOIN usuario u ON us.id_usuario_per = u.id_usuario
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_seguro = ?
  `;
  const sqlBeneficios = `
    SELECT b.nombre
    FROM seguro_beneficio sb
    JOIN beneficio b ON sb.id_beneficio_per = b.id_beneficio
    JOIN usuario_seguro us ON sb.id_seguro_per = us.id_seguro_per
    WHERE us.id_usuario_seguro = ?
  `;
  const sqlRequisitos = `
   SELECT ur.id_usuario_requisito, r.id_requisito, r.nombre, ur.path_archivo
    FROM seguro_requisito sr
    JOIN requisito r ON sr.id_requisito_per = r.id_requisito
    JOIN usuario_seguro us ON sr.id_seguro_per = us.id_seguro_per
    LEFT JOIN usuario_requisito ur
      ON ur.id_usuario_seguro = us.id_usuario_seguro
      AND ur.id_requisito = r.id_requisito
    WHERE us.id_usuario_seguro = ?
  `;

  const sqlBeneficiarios = `
    SELECT nombre, parentesco, cedula
    FROM beneficiario
    WHERE id_usuario_seguro = ?
  `;

  db.query(sqlContrato, [id], (err, resultContrato) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener contrato' });
    }
    if (!resultContrato.length) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    const contrato = resultContrato[0];

    db.query(sqlBeneficios, [id], (err2, beneficios) => {
      if (err2) {
        contrato.beneficios = [];
      } else {
        contrato.beneficios = beneficios.map(b => b.nombre);
      }

      db.query(sqlRequisitos, [id], (err3, requisitos) => {
        if (err3) {
          contrato.requisitos = [];
        } else {
          const requisitosMap = new Map();
          requisitos.forEach(r => {
            if (!requisitosMap.has(r.id_requisito)) {
              requisitosMap.set(r.id_usuario_requisito, {
                id_usuario_requisito: r.id_usuario_requisito, // ✅ para frontend
                nombre: r.nombre,
                archivo: r.path_archivo || null
              });
            }
          });
          contrato.requisitos = Array.from(requisitosMap.values());
        }

        db.query(sqlBeneficiarios, [id], (err4, beneficiarios) => {
          if (err4) {
            contrato.beneficiarios = [];
          } else {
            contrato.beneficiarios = beneficiarios;
          }
          res.json(contrato);
        });
      });
    });
  });
});

// --- DETALLE COMPLETO DE UN CONTRATO (incluye algunos campos extra)
router.get('/detalle-completo/:id', (req, res) => {
  const { id } = req.params;
  const sqlContrato = `
    SELECT
      us.id_usuario_seguro,
      u.nombre AS cliente,
      u.apellido AS apellido_cliente,
      s.nombre AS seguro,
      s.tipo,
      s.precio,
      s.cobertura,
      us.fecha_contrato,
      us.hora,
      us.firma
    FROM usuario_seguro us
    JOIN usuario u ON us.id_usuario_per = u.id_usuario
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_seguro = ?
  `;
  const sqlBeneficiarios = `
    SELECT nombre, parentesco, cedula, fecha_nacimiento
    FROM beneficiario
    WHERE id_usuario_seguro = ?
  `;
  const sqlRequisitos = `
    SELECT ur.id_usuario_requisito, r.nombre, ur.path_archivo AS archivo
    FROM seguro_requisito sr
    JOIN requisito r ON sr.id_requisito_per = r.id_requisito
    JOIN usuario_seguro us ON sr.id_seguro_per = us.id_seguro_per
    LEFT JOIN usuario_requisito ur
      ON ur.id_usuario_seguro = us.id_usuario_seguro
      AND ur.id_requisito = r.id_requisito
    WHERE us.id_usuario_seguro = ?
  `;

  db.query(sqlContrato, [id], (err1, resultContrato) => {
    if (err1 || !resultContrato.length) {
      return res.status(500).json({ error: 'Error al obtener contrato' });
    }
    const contrato = resultContrato[0];

    db.query(sqlBeneficiarios, [id], (err2, beneficiarios) => {
      if (err2) {
        contrato.beneficiarios = [];
      } else {
        contrato.beneficiarios = beneficiarios;
      }

      db.query(sqlRequisitos, [id], (err3, requisitos) => {
        if (err3) {
          contrato.requisitos = [];
        } else {
          const requisitosMap = new Map();
          requisitos.forEach(r => {
            if (!requisitosMap.has(r.id_requisito)) {
              requisitosMap.set(r.id_usuario_requisito, {
                id_usuario_requisito: r.id_usuario_requisito,// ✅ esto lo necesitas
                nombre: r.nombre,
                archivo: r.archivo || null
              });
            }
          });
          contrato.requisitos = Array.from(requisitosMap.values());
        }
        return res.json(contrato);
      });
    });
  });
});

// --- CONTRATOS “mis-seguros” POR CLIENTE (SOLO ACEPTADOS para pagos) con cálculo de próxima fecha
router.get('/mis-seguros/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
  us.id_usuario_seguro,
  us.fecha_contrato,
  us.modalidad_pago,
  us.estado_pago,           -- ✅ AÑADIR ESTE CAMPO
  s.nombre,
  s.precio,
  s.cobertura
    FROM usuario_seguro us
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_per = ? AND us.estado = 1
  `;

  db.query(sql, [id], (err, contratos) => {
    if (err) {
      console.error('❌ Error al obtener contratos aceptados del cliente:', err);
      return res.status(500).send('Error al obtener contratos aceptados');
    }

    // Para cada contrato, obtenemos la última fecha de pago y calculamos el próximo vencimiento
    const promesas = contratos.map((c) => {
      return new Promise((resolve, reject) => {
        const sqlUltPago = `
          SELECT MAX(fecha_pago) AS ultima_fecha
          FROM pago_seguro
          WHERE id_usuario_seguro_per = ?
        `;
        db.query(sqlUltPago, [c.id_usuario_seguro], (err2, rowsPago) => {
          if (err2) {
            return reject(err2);
          }

          // Determinar la fecha de referencia (última_fecha si existe, o fecha_contrato)
          let fechaReferencia = c.fecha_contrato;
          if (rowsPago.length && rowsPago[0].ultima_fecha) {
            fechaReferencia = rowsPago[0].ultima_fecha;
          }

          // Calcular próximo vencimiento
          const proximoVencimientoDate = agregarPeriodo(fechaReferencia, c.modalidad_pago);
          const yyyy = proximoVencimientoDate.getFullYear();
          const mm = String(proximoVencimientoDate.getMonth() + 1).padStart(2, '0');
          const dd = String(proximoVencimientoDate.getDate()).padStart(2, '0');
          c.proximo_vencimiento = `${yyyy}-${mm}-${dd}`;

          // Incluir también la última fecha de pago, si existe
          if (rowsPago.length && rowsPago[0].ultima_fecha) {
            const uf = new Date(rowsPago[0].ultima_fecha);
            const ufy = uf.getFullYear();
            const ufm = String(uf.getMonth() + 1).padStart(2, '0');
            const ufd = String(uf.getDate()).padStart(2, '0');
            c.ultima_fecha_pago = `${ufy}-${ufm}-${ufd}`;
          } else {
            c.ultima_fecha_pago = null;
          }

          resolve(c);
        });
      });
    });

    Promise.all(promesas)
      .then((contratosConFechas) => {
        return res.json(contratosConFechas);
      })
      .catch((error) => {
        console.error('❌ Error calculando próximas fechas:', error);
        return res.status(500).send('Error interno calculando fechas de vencimiento');
      });
  });
});

//----------------------------------------------------------------------------------------------------------------------------------
router.get('/descarga/requisito-por-id/:id_usuario_seguro/:id_usuario_requisito', async (req, res) => {
  const { id_usuario_seguro, id_usuario_requisito } = req.params;

  db.query(
    `SELECT path_archivo FROM usuario_requisito WHERE id_usuario_seguro = ? AND id_usuario_requisito = ?`,
    [id_usuario_seguro, id_usuario_requisito],
    async (err, rows) => {
      if (err) {
        console.error(`[GET /descarga/requisito-por-id] Error DB:`, err);
        return res.status(500).json({ error: 'Error al buscar archivo del requisito' });
      }

      if (!rows.length || !rows[0].path_archivo) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }

      try {
        const key = rows[0].path_archivo;
        const url = await obtenerUrlArchivo(key);
        res.json({ url });
      } catch (err2) {
        console.error(`[GET /descarga/requisito-por-id] Error generando URL S3:`, err2);
        res.status(500).json({ error: 'No se pudo generar la URL del archivo' });
      }
    });
});


router.get('/descarga/requisito/:id_usuario_seguro/:id_requisito', async (req, res) => {
  const { id_usuario_seguro, id_requisito } = req.params;

  const sql = `
    SELECT path_archivo
    FROM usuario_requisito
    WHERE id_usuario_seguro = ? AND id_requisito = ?
  `;

  db.query(sql, [id_usuario_seguro, id_requisito], async (err, rows) => {
    if (err) {
      console.error(`[GET /descarga/requisito] Error DB:`, err);
      return res.status(500).json({ error: 'Error al buscar archivo del requisito' });
    }

    if (!rows.length || !rows[0].path_archivo) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    try {
      const key = rows[0].path_archivo;
      const url = await obtenerUrlArchivo(key);
      res.json({ url });
    } catch (err2) {
      console.error(`[GET /descarga/requisito] Error generando URL S3:`, err2);
      res.status(500).json({ error: 'No se pudo generar la URL del archivo' });
    }
  });
});


module.exports = router;
