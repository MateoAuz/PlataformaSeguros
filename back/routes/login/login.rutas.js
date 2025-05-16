const express = require('express');
const router = express.Router();
const db = require('../../db/connection');



router.post('/', (req, res) => {
    console.log("Cuerpo recibido:", req.body);

    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const query = `
        SELECT id_usuario, correo, tipo, activo
        FROM usuario
        WHERE correo = ? AND password = ? AND activo = 1
        LIMIT 1
    `;

    console.log("Ejecutando query con:", correo, password);

    db.query(query, [correo, password], (err, results) => {
        if (err) {
            console.error("ERROR en la consulta SQL:", err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }

        console.log("Resultado de la consulta:", results);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas o cuenta inactiva.' });
        }

        return res.status(200).json({
            mensaje: 'Login exitoso',
            usuario: results[0]
        });
    });
});

module.exports = router;
