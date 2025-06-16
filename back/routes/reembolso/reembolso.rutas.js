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
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO documento_reembolso
             (id_reembolso, nombre_archivo, path_archivo)
           VALUES (?, ?, ?)`,
          [idReembolso, file.originalname, keyS3],
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



module.exports = router;
