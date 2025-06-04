const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    req.files.forEach(file => {
      if (file.fieldname === 'firma_pdf') {
        firmaArchivo = file;
      } else if (file.fieldname.startsWith('documentos[')) {
        // fieldname ejemplo: documentos[3]
        const idRequisito = file.fieldname.match(/documentos\[(\d+)\]/)[1];
        documentos[idRequisito] = {
          path: getRelativePath(file.path),
          originalName: file.originalname
        };
      }
    });

    if (!firmaArchivo) {
      return res.status(400).send('Falta la firma PDF');
    }

    // Path relativo para guardar en BD
    const firmaBD = getRelativePath(firmaArchivo.path);

    // Fecha actual en formato “YYYY-MM-DD” y hora “HH:MM:SS”
    const fecha = new Date();
    const yyyyMMdd = fecha.toISOString().split('T')[0];
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
      function (err, result) {
        if (err) {
          console.error('❌ Error al insertar contrato:', err);
          return res.status(500).send('Error al guardar el contrato');
        }
        const id_usuario_seguro = result.insertId;

        // Guardar los documentos de requisitos (si existen)
        const inserts = []; // matriz de [id_usuario_seguro, id_requisito, nombre_archivo, path_archivo, validado]
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
            // Supongamos que req.body.beneficiarios = { "0": "{\"nombre\":\"Ana\",\"cedula\":\"0101\",\"parentesco\":\"Hija\",\"nacimiento\":\"2023-01-01\"}", ... }
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
  const sql = `UPDATE usuario_seguro SET estado = 3 WHERE id_usuario_seguro = ?`;
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('❌ Error al rechazar contrato:', err);
      return res.status(500).json({ mensaje: 'Error al rechazar contrato' });
    }
    res.status(200).json({ mensaje: 'Contrato rechazado con éxito' });
  });
});

// --- Obtener todos los contratos ACEPTADOS (estado = 1)
router.get('/aceptados', (req, res) => {
  const sql = `
    SELECT
      us.id_usuario_seguro,
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
      s.tipo
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

// --- CONTRATOS “mis-seguros” POR CLIENTE (solo campos necesarios para pagos)
router.get('/mis-seguros/:id', (req, res) => {
  const { id } = req.params;                 // antes era id_usuario
  const sql = `
    SELECT
      us.id_usuario_seguro,
      s.nombre,
      s.precio,
      us.modalidad_pago
    FROM usuario_seguro us
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_per = ?
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener contratos del cliente:', err);
      return res.status(500).send('Error al obtener contratos');
    }
    res.json(rows);
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
    SELECT r.nombre
    FROM seguro_requisito sr
    JOIN requisito r ON sr.id_requisito_per = r.id_requisito
    JOIN usuario_seguro us ON sr.id_seguro_per = us.id_seguro_per
    WHERE us.id_usuario_seguro = ?
  `;
  const sqlBeneficiarios = `
    SELECT nombre, parentesco
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
          contrato.requisitos = requisitos.map(r => r.nombre);
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
      TIME(us.fecha_contrato) AS hora,
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
    SELECT r.nombre, rs.path_archivo AS archivo
    FROM seguro_requisito sr
    JOIN requisito r ON sr.id_requisito_per = r.id_requisito
    LEFT JOIN requisito_seguro rs
      ON rs.id_requisito_per = r.id_requisito
      AND rs.id_usuario_seguro_per = ?
    WHERE sr.id_seguro_per = (
      SELECT id_seguro_per
      FROM usuario_seguro
      WHERE id_usuario_seguro = ?
    )
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

      db.query(sqlRequisitos, [id, id], (err3, requisitos) => {
        if (err3) {
          contrato.requisitos = [];
        } else {
          contrato.requisitos = requisitos;
        }
        return res.json(contrato);
      });
    });
  });
});

module.exports = router;
