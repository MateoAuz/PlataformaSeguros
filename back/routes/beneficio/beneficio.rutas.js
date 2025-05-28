const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

// Obtener todos los beneficios
router.get('/', (req, res) => {
  db.query('SELECT * FROM beneficio', (err, results) => {
    if (err) return res.status(500).send('Error al obtener beneficios');
    res.json(results);
  });
});

// Crear nuevo beneficio ✅ <-- AQUI VA TU CÓDIGO
router.post('/', (req, res) => {
  const { nombre, detalle } = req.body;
  db.query('INSERT INTO beneficio (nombre, detalle) VALUES (?, ?)', [nombre, detalle], (err, result) => {
    if (err) return res.status(500).send('Error al crear beneficio');
    res.status(201).json({ id: result.insertId });
  });
});

module.exports = router;
