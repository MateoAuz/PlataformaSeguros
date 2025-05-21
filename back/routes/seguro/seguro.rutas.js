const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

router.get('/', (req, res) => {
  db.query('SELECT * FROM seguro', (err, resultado) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al consultar los seguros' });
    } else {
      res.json(resultado);
    }
  });
});

module.exports = router;
