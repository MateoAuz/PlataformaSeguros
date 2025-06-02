const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuración de subida de archivos (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'contratos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, ''));
  }
});
const upload = multer({ storage });

// --- Helper para path relativo seguro
const uploadsFolder = path.join(process.cwd(), 'uploads');
function getRelativePath(fullPath) {
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

    // Documentos recibidos
    let firmaArchivo = null;
    const documentos = {};
    req.files.forEach(file => {
      if (file.fieldname === "firma_pdf") {
        firmaArchivo = file;
      } else if (file.fieldname.startsWith("documentos[")) {
        const idRequisito = file.fieldname.match(/documentos\[(\d+)\]/)[1];
        documentos[idRequisito] = {
          path: getRelativePath(file.path),
          originalName: file.originalname
        };
      }
    });
    if (!firmaArchivo) return res.status(400).send('Falta la firma PDF');

    // Guardar path relativo para firma
    const firmaBD = getRelativePath(firmaArchivo.path);

    // Fecha/hora actuales
    const fecha = new Date();
    const yyyyMMdd = fecha.toISOString().split('T')[0];
    const hhmmss = fecha.toTimeString().split(' ')[0];

    // Insertar contrato
    const sqlContrato = `
      INSERT INTO usuario_seguro
      (id_usuario_per, id_seguro_per, fecha_contrato, estado, modalidad_pago, firma, hora)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sqlContrato, [
      id_usuario, id_seguro, yyyyMMdd, 0, modalidad_pago, firmaBD, hhmmss
    ], function (err, result) {
      if (err) {
        console.error('❌ Error al insertar contrato:', err);
        return res.status(500).send('Error al guardar el contrato');
      }
      const id_usuario_seguro = result.insertId;

      // Guardar documentos requisitos
      const inserts = [];
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
        const sqlDoc = `INSERT INTO usuario_requisito
          (id_usuario_seguro, id_requisito, nombre_archivo, path_archivo, validado)
          VALUES ?`;
        db.query(sqlDoc, [inserts], (errDoc) => {
          if (errDoc) console.error('❌ Error documentos:', errDoc);
        });
      }

      // Guardar beneficiarios
      if (req.body['beneficiarios[0]']) {
        let b = 0;
        while (req.body[`beneficiarios[${b}]`]) {
          const ben = JSON.parse(req.body[`beneficiarios[${b}]`]);
          db.query(
            `INSERT INTO beneficiario (id_usuario_seguro, nombre, cedula, parentesco, fecha_nacimiento)
             VALUES (?, ?, ?, ?, ?)`,
            [
              id_usuario_seguro,
              ben.nombre,
              ben.cedula,
              ben.parentesco,
              ben.nacimiento ?? null
            ],
            (errB) => { if (errB) console.error('❌ Error beneficiario:', errB); }
          );
          b++;
        }
      }

      res.status(201).json({ id: id_usuario_seguro, ok: true });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error interno al registrar el contrato');
  }
});

// --- DETALLE DEL CONTRATO (MOSTRAR TODO)
router.get('/detalle/:id', (req, res) => {
  const id = req.params.id;

  // Consulta info general del contrato + nombre cliente
  const sqlContrato = `
    SELECT us.*, u.nombre AS cliente, u.apellido AS apellido_cliente, s.nombre AS seguro, s.tipo
    FROM usuario_seguro us
    JOIN usuario u ON us.id_usuario_per = u.id_usuario
    JOIN seguro s ON us.id_seguro_per = s.id_seguro
    WHERE us.id_usuario_seguro = ?
  `;
  db.query(sqlContrato, [id], (err, contratos) => {
    if (err || contratos.length === 0) return res.status(404).send('No encontrado');
    const row = contratos[0];

    // Beneficiarios
    db.query(
      `SELECT nombre, cedula, parentesco, fecha_nacimiento AS nacimiento FROM beneficiario WHERE id_usuario_seguro = ?`,
      [id],
      (errB, beneficiarios) => {

        // Requisitos/documentos
        db.query(
          `SELECT r.nombre, ur.nombre_archivo, ur.path_archivo
           FROM usuario_requisito ur
           JOIN requisito r ON ur.id_requisito = r.id_requisito
           WHERE ur.id_usuario_seguro = ?`,
          [id],
          (errR, requisitos) => {
            requisitos = (requisitos || []).map(r => ({
              nombre: r.nombre,
              archivo: r.path_archivo
                ? `http://localhost:3030/${r.path_archivo.replace(/\\/g, '/')}`
                : null,
              nombreArchivo: r.nombre_archivo || ''
            }));

            // Firma electrónica (PDF)
            const firmaUrl = row.firma ? `http://localhost:3030/${row.firma.replace(/\\/g, '/')}` : null;

            res.json({
              ...row,
              apellido_cliente: row.apellido_cliente,
              beneficiarios,
              requisitos,
              firma: firmaUrl
            });
          }
        );
      }
    );
  });
});

// --- SOLICITUDES PENDIENTES (PARA AGENTE)
router.get('/pendientes', (req, res) => {
  const sql = `
    SELECT us.id_usuario_seguro, u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, 
           s.nombre AS nombre_seguro, s.tipo, s.tiempo_pago, us.fecha_contrato
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

module.exports = router;
