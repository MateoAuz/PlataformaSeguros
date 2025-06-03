const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../../db/connection');

const multer = require('multer');
const subirArchivo = require('../../s3/subirArchivo')
const fs = require('fs');
const path = require('path');
const { console } = require('inspector');

const upload = multer({ dest: 'uploads/'});

router.post('/', upload.single('archivo'), async(req, res) => {
  const file = req.file;//s3
  try{
    console.log("Archivo recibido:",file);
    await subirArchivo(file.path, file.originalname);
    //fs.unlinkSync(file.path);//para eliminar el archivo locar
    res.json({message: "Archivo subido correctamente a s3"});//mensaje aprobado
  }catch (err) {
    console.error("Error detallado al subir archivo:", err);
    res.status(500).json({error: 'Error al subir archivo', detalle: err.message});
  }

  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  const query = `
    SELECT id_usuario, correo, username, nombre, apellido, password, tipo, activo, cedula, telefono
    FROM usuario
    WHERE correo = ?
    LIMIT 1
  `;

  db.query(query, [correo], async (err, results) => {
    if (err) {
      console.error('Error en la consulta SQL:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = results[0];

    if (usuario.activo !== 1) {
      return res.status(403).json({ error: 'La cuenta está desactivada.' });
    }

    const coincide = await bcrypt.compare(password, usuario.password);

    if (!coincide) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    // Puedes omitir el hash antes de responder
    delete usuario.password;

    return res.status(200).json({
      mensaje: 'Login exitoso',
      usuario
    });
  });
});

module.exports = router;