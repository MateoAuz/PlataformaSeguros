const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const multer = require('multer');
const path = require('path');
const subirArchivo = require('../../s3/subirArchivo');
const fs = require('fs');

// Configuración de almacenamiento para comprobantes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/pagos/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '');
    cb(null, uniqueName);
  }
});

const upload = multer({ dest: 'uploads/' });

//s3 listar
const listarArchivos = require('../../s3/listarArchivos');
//s3 descarga
const obtenerUrlArchivo = require('../../s3/obtenerUrl');
//s3 eliminar
const eliminarArchivo = require('../../s3/eliminarArchivo');

router.post('/', upload.single('archivo'), async (req, res) => {
  const file = req.file; //s3
  try {
    console.log("Archivo recibido:", file);
    await subirArchivo(file.path, file.originalname);
    fs.unlinkSync(file.path); // para eliminar el archivo local
    res.json({ mensaje: 'Archivo subido correctamente a S3' }); //mensaje aprobado
  } catch (err) {
    console.error("Error detallado al subir archivo:", err);
    res.status(500).json({ error: 'Error al subir el archivo', detalle: err.message });
  }
});

// ✅ Obtener seguros contratados de un cliente
router.get('/cliente/:idUsuario', (req, res) => {
  const sql = `
    SELECT ps.id_pago_seguro, ps.fecha_pago, ps.cantidad, ps.comprobante_pago,
       s.nombre AS nombre_seguro, s.precio AS precio_seguro
FROM pago_seguro ps
JOIN usuario_seguro us ON ps.id_usuario_seguro_per = us.id_usuario_seguro
JOIN seguro s ON us.id_seguro_per = s.id_seguro
WHERE us.id_usuario_per = ?
ORDER BY ps.fecha_pago DESC
  `;
  db.query(sql, [req.params.idUsuario], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener contratos' });
    res.json(results);
  });
});

// ✅ Obtener pagos realizados por un cliente
router.get('/pagos/cliente/:idUsuario', (req, res) => {
  const sql = `
    SELECT p.id_pago_seguro, s.nombre, p.fecha_pago, IFNULL(p.cantidad, 0) AS cantidad, p.comprobante_pago, s.precio
FROM pago_seguro p
JOIN usuario_seguro us ON p.id_usuario_seguro_per = us.id_usuario_seguro
JOIN seguro s ON us.id_seguro_per = s.id_seguro
WHERE us.id_usuario_per = ?
ORDER BY p.fecha_pago DESC
  `;
  db.query(sql, [req.params.idUsuario], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener pagos' });
    res.json(results);
  });
});

// ✅ Registrar nuevo pago solo si contrato está ACTIVO (estado = 1)
router.post('/pagos', upload.single('comprobante'), async (req, res) => {


  const { id_usuario_seguro_per, cantidad, usuario } = req.body;
  const file = req.file;

  if (!file || !cantidad || !id_usuario_seguro_per || !usuario) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Verificar contrato activo
  const sqlVerificar = `
    SELECT * FROM usuario_seguro 
    WHERE id_usuario_seguro = ? AND estado = 1
  `;
  db.query(sqlVerificar, [id_usuario_seguro_per], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ error: 'El contrato no está activo o no existe' });
    }

    try {
      const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '');
      await subirArchivo(file.path, uniqueName, usuario);
      const urlS3 = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${usuario}/${uniqueName}`;
      fs.unlinkSync(file.path);

      const sqlInsert = `
        INSERT INTO pago_seguro (id_usuario_seguro_per, fecha_pago, cantidad, comprobante_pago)
        VALUES (?, CURDATE(), ?, ?)
      `;
      db.query(sqlInsert, [id_usuario_seguro_per, cantidad, urlS3], (err2) => {
        if (err2) return res.status(500).json({ error: 'Error al guardar el pago', detalle: err2.message });
        res.json({ message: 'Pago guardado exitosamente' });
      });
    } catch (err) {
      console.error("Error S3/Pago:", err);
      res.status(500).json({ error: 'Error interno', detalle: err.message });
    }
  });
});


module.exports = router;
