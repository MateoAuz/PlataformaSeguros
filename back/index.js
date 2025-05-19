const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3030;

// ⛳ PRIMERO: habilitar JSON (¡esto es clave!)
app.use(express.json());

// ✅ LUEGO: permitir CORS desde React
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// ✅ Luego se cargan las rutas
const usuarioRutas = require('./routes/usuario/usuario.rutas');
const loginRutas = require('./routes/login/login.rutas');
const seguroRutas = require('./routes/seguro/seguro.rutas');

app.use('/usuario', usuarioRutas);
app.use('/login', loginRutas);
app.use('/seguro', seguroRutas);

// Ruta base
app.get("/", (req, res) => {
    res.send("API en línea");
});

app.listen(PORT, () => {
    console.log(`Servidor Express en http://localhost:${PORT}`);
});
