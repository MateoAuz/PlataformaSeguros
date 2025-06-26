const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const bcrypt = require('bcrypt');

// ✅ Obtener usuarios activos
router.get('/', (req, res) => {
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username, tipo FROM usuario WHERE activo = 1';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar usuarios' });
    res.json(results);
  });
});

// ✅ Crear nuevo usuario (con encriptación de contraseña)
router.post('/', async (req, res) => {
  const { nombre, apellido, correo, username, password, tipo, cedula, telefono } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO usuario (nombre, apellido, correo, username, password, tipo, activo, cedula, telefono) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)';
    const values = [nombre, apellido, correo, username, hashedPassword, tipo, cedula, telefono];

    db.query(sql, values, (err, result) => {
      if (err) {
        // Detalle del error SQL
        console.error('Error SQL al registrar usuario:', err);
        return res.status(500).json({ error: 'Error al registrar usuario', detalle: err.sqlMessage || err.message });
      }
      res.status(201).json({ id: result.insertId });
    });
  } catch (err) {
    console.error('Error al encriptar contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
  }
});

// ✅ Editar usuario existente
router.put('/:id', (req, res) => {
  const { nombre, apellido, correo, username, tipo, cedula, telefono } = req.body;
  const sql = 'UPDATE usuario SET nombre=?, apellido=?, correo=?, username=?, tipo=?, cedula=?, telefono=? WHERE id_usuario=?';
  const values = [nombre, apellido, correo, username, tipo, cedula, telefono, req.params.id];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('Error SQL al actualizar usuario:', err);
      return res.status(500).json({ error: 'Error al actualizar usuario', detalle: err.sqlMessage || err.message });
    }
    res.sendStatus(200);
  });
});

// ✅ Desactivar usuario
router.patch('/:id/desactivar', (req, res) => {
  const sql = 'UPDATE usuario SET activo = 0 WHERE id_usuario = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al desactivar usuario' });
    res.sendStatus(200);
  });
});

// ✅ Obtener usuarios desactivados
router.get('/inactivos', (req, res) => {
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username, tipo FROM usuario WHERE activo = 0';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar usuarios inactivos' });
    res.json(results);
  });
});

// ✅ Activar usuario
router.patch('/:id/activar', (req, res) => {
  const sql = 'UPDATE usuario SET activo = 1 WHERE id_usuario = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al activar usuario' });
    res.sendStatus(200);
  });
});

// ✅ Número de clientes activos
router.get('/conteo/clientes', (req, res) => {
  const sql = 'SELECT COUNT(*) AS total FROM usuario WHERE tipo = 2 AND activo = 1';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al contar clientes' });
    res.json(results[0]);
  });
});

// ✅ Obtener usuario por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username, tipo, cedula, telefono FROM usuario WHERE id_usuario = ?';

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el usuario' });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(results[0]);
  });
});

// ✅ Obtener solicitudes pendientes de clientes
router.get('/solicitudes', (req, res) => {
  const sql = 'SELECT id_usuario, nombre, apellido, correo, username FROM usuario WHERE tipo = 2 AND activo = 0';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar solicitudes' });
    res.json(results);
  });
});

// ✅ Aprobar solicitud de cliente
router.put('/:id/activar-cliente', (req, res) => {
  const sql = 'UPDATE usuario SET activo = 1 WHERE id_usuario = ? AND tipo = 2';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al activar cliente' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado o ya activo' });
    res.sendStatus(200);
  });
});

// ✅ Buscar usuario por cédula y tipo (para validación en front)
router.get('/buscar', (req, res) => {
  const { cedula, tipo } = req.query;
  if (!cedula || typeof tipo === 'undefined') {
    return res.status(400).json({ error: 'Cédula y tipo requeridos' });
  }
  const sql = 'SELECT * FROM usuario WHERE cedula = ? AND tipo = ?';
  db.query(sql, [cedula, tipo], (err, results) => {
    if (err) {
      console.error('Error SQL al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al buscar usuario', detalle: err.sqlMessage || err.message });
    }
    if (results.length > 0) return res.status(200).json(results[0]);
    return res.status(404).json({ error: 'No encontrado' });
  });
});

// ✅ Contar contrataciones pendientes desde usuario_seguro
router.get('/conteo/pendientes', (req, res) => {
  const sql = 'SELECT COUNT(*) AS total FROM usuario_seguro WHERE estado = 0';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al contar contrataciones pendientes' });
    res.json(results[0]);
  });
});


module.exports = router;