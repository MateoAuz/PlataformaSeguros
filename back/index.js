const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3030;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// ✅ Carga de rutas
const usuarioRutas = require('./routes/usuario/usuario.rutas');
const loginRutas = require('./routes/login/login.rutas');
const seguroRutas = require('./routes/seguro/seguro.rutas');
const coberturaRouter = require('./routes/cobertura/cobertura.rutas');
const beneficioRouter = require('./routes/beneficio/beneficio.rutas');
const requisitoRouter = require('./routes/requisito/requisito.rutas');
const contratoRouter = require('./routes/contrato/contrato.rutas');
const path = require('path');

const pagosRouter = require('./routes/pago/pagos.rutas');
app.use('/pagos', pagosRouter);
app.use('/uploads', express.static('uploads')); // para servir archivos



app.use('/usuario', usuarioRutas);
app.use('/login', loginRutas);
app.use('/seguros', seguroRutas);
app.use('/cobertura', coberturaRouter);
app.use('/beneficio', beneficioRouter);
app.use('/requisito', requisitoRouter);
app.use('/contratos', contratoRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta base
app.get("/", (req, res) => {
    res.send("API en línea");
});

app.listen(PORT, () => {
    console.log(`Servidor Express en http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer error:", err);
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
