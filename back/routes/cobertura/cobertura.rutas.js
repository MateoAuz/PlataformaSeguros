const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/', (req, res) => {
  db.query('SELECT * FROM cobertura', (err, results) => {
    if (err) return res.status(500).send('Error al obtener coberturas');
    res.json(results);
  });
});

module.exports = router;
