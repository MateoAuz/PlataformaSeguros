const bcrypt = require('bcrypt');
const db = require('../../db/connection');
const express = require('express');
const router = express.Router();


// --- Función utilitaria para validar números
const esNumeroValido = (valor) => /^\d+$/.test(valor);



// Obtener todos los clientes (activos o inactivos)
router.get('/clientes', (req, res) => {
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username, activo AS estado FROM usuario WHERE tipo = 2';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar clientes' });
    res.json(results);
  });
});



// Crear cliente (tipo = 2)
// Crear cliente normal (tipo = 2)
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, correo, username, password, cedula, telefono } = req.body;

    if (!nombre || !apellido || !correo || !username || !password || !cedula || !telefono) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (!esNumeroValido(cedula) || !esNumeroValido(telefono)) {
      return res.status(400).json({ error: 'Cédula y teléfono deben contener solo números' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO usuario (nombre, apellido, correo, username, password, tipo, activo, cedula, telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [nombre, apellido, correo, username, hashedPassword, 2, 1, cedula, telefono];

    db.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear cliente', detalle: err.sqlMessage });
      res.status(201).json({ id: result.insertId });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno', detalle: err.message });
  }
});


// Editar cliente
router.put('/:id', (req, res) => {
  const nombre = req.body.nombre?.trim() || '';
  const apellido = req.body.apellido?.trim() || '';
  const correo = req.body.correo?.trim() || '';
  const username = req.body.username?.trim() || '';
  const cedula = req.body.cedula?.trim() || '';
  const telefono = req.body.telefono?.trim() || '';

  if (!esNumeroValido(cedula) || !esNumeroValido(telefono)) {
    return res.status(400).json({ error: 'Cédula y teléfono deben contener solo números' });
  }

  const sql = `
    UPDATE usuario
    SET nombre = ?, apellido = ?, correo = ?, username = ?, cedula = ?, telefono = ?
    WHERE id_usuario = ? AND tipo = 2`;
  const values = [nombre, apellido, correo, username, cedula, telefono, req.params.id];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: 'Error al editar cliente', detalle: err.sqlMessage });
    res.sendStatus(200);
  });
});

// Desactivar cliente
router.put('/:id/desactivar', (req, res) => {
  const sql = 'UPDATE usuario SET activo = 0 WHERE id_usuario = ? AND tipo = 2';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al desactivar cliente' });
    res.sendStatus(200);
  });
});

// Activar cliente
router.patch('/:id/activar', (req, res) => {
  const sql = 'UPDATE usuario SET activo = 1 WHERE id_usuario = ? AND tipo = 2';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al activar cliente' });
    res.sendStatus(200);
  });
});




module.exports = router;
