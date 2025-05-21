const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../../db/connection');

router.post('/', (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  const query = `
    SELECT id_usuario, correo, username, nombre, apellido, tipo, activo, cedula, telefono
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
