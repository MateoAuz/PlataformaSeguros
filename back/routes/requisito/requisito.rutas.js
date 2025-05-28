const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

// Obtener todos los requisitos
router.get('/', (req, res) => {
  db.query('SELECT * FROM requisito', (err, results) => {
    if (err) return res.status(500).send('Error al obtener requisitos');
    res.json(results);
  });
});

// Crear nuevo requisito
router.post('/', (req, res) => {
  const { nombre, detalle } = req.body;
  if (!nombre || !detalle) {
    return res.status(400).send('Nombre y detalle son obligatorios');
  }

  db.query(
    'INSERT INTO requisito (nombre, detalle) VALUES (?, ?)',
    [nombre, detalle],
    (err, result) => {
      if (err) return res.status(500).send('Error al crear requisito');
      res.status(201).json({ id: result.insertId });
    }
  );
});

module.exports = router;
