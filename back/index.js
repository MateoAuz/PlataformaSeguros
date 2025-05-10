const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3030;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Josema*2502',
    database: 'gestion_seguros'
});

db.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

app.get("/", (req, res) => {
    res.send("probando la api desde la web");
});

app.get("/usuario", (req, res) => {
    db.query('SELECT * FROM usuario', (err, resultado) => {
        if (err) return res.status(500).json({ error: 'Error al obtener los usuarios' });
        res.json(resultado);
    });
});

app.post("/usuarioIngreso", (req, res) => {
    const datos = req.body;
    db.query("INSERT INTO usuario SET ?", datos, (err, resultado) => {
        if (err) return res.status(500).json({ error: "Error al insertar usuario" });
        res.json({ id: resultado.insertId, ...datos });
    });
});

app.put("/usuarioActualizar/:id", (req, res) => {
    const { id } = req.params;
    const datos = req.body;
    db.query("UPDATE usuario SET ? WHERE id_usuario = ?", [datos, id], (err) => {
        if (err) return res.status(500).json({ error: "Error al actualizar usuario" });
        res.json({ message: "Usuario actualizado" });
    });
});

app.delete("/usuarioEliminar/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM usuario WHERE id_usuario = ?", id, (err) => {
        if (err) return res.status(500).json({ error: "Error al eliminar usuario" });
        res.json({ message: "Usuario eliminado" });
    });
});

app.get("/seguro", (req, res) => {
    db.query("SELECT * FROM seguro", (err, resultado) => {
        if (err) return res.status(500).json({ error: "Error al obtener seguros" });
        res.json(resultado);
    });
});

app.post("/seguroIngreso", (req, res) => {
    const datos = req.body;
    db.query("INSERT INTO seguro SET ?", datos, (err, resultado) => {
        if (err) return res.status(500).json({ error: "Error al insertar seguro" });
        res.json({ id: resultado.insertId, ...datos });
    });
});

app.put("/seguroActualizar/:id", (req, res) => {
    const { id } = req.params;
    const datos = req.body;
    db.query("UPDATE seguro SET ? WHERE id_seguro = ?", [datos, id], (err) => {
        if (err) return res.status(500).json({ error: "Error al actualizar seguro" });
        res.json({ message: "Seguro actualizado" });
    });
});

app.delete("/seguroEliminar/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM seguro WHERE id_seguro = ?", id, (err) => {
        if (err) return res.status(500).json({ error: "Error al eliminar seguro" });
        res.json({ message: "Seguro eliminado" });
    });
});

app.post("/login", (req, res) => {
    console.log("Solicitud recibida:", req.body);

    const { correo, password } = req.body;

    const sql = `
        SELECT id_usuario, tipo FROM usuario 
        WHERE correo = ? AND password = ? AND activo = 1
    `;

    db.query(sql, [correo, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Error en el servidor" });
        if (results.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        res.json({
            id: results[0].id_usuario,
            tipo: results[0].tipo
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor en línea en puerto: http://localhost:${PORT}`);
});
