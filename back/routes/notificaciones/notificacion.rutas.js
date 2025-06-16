// routes/notificaciones/notificacion.rutas.js
const express = require('express');
const router  = express.Router();
const db      = require('../../db/connection');

router.get('/cliente/:id', (req, res) => {
  const sql = `
    SELECT 
      id_notificacion,
      mensaje,
      DATE_FORMAT(fecha, '%Y-%m-%d %H:%i:%s') AS fecha
    FROM notificacion
    WHERE id_usuario = ?
    ORDER BY fecha DESC
  `;
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).send('Error al obtener notificaciones');
    res.json(rows);
  });
});

module.exports = router;
