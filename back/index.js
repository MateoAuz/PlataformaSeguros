// index.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3030;

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// ──────────────────────────────────────────────────────────────────────────
// Rutas de tu API
const usuarioRutas    = require('./routes/usuario/usuario.rutas');
const loginRutas      = require('./routes/login/login.rutas');
const seguroRutas     = require('./routes/seguro/seguro.rutas');
const coberturaRouter = require('./routes/cobertura/cobertura.rutas');
const beneficioRouter = require('./routes/beneficio/beneficio.rutas');
const requisitoRouter = require('./routes/requisito/requisito.rutas');
const contratoRouter  = require('./routes/contrato/contrato.rutas');
const pagosRouter     = require('./routes/pago/pagos.rutas');  // ← aquí
const codigoRutas = require('./routes/codigo/codigo.rutas');
app.use('/enviar-codigo', codigoRutas);

app.use('/usuario', usuarioRutas);
app.use('/cliente', require('./routes/cliente/cliente.rutas'));

app.use('/login', loginRutas);
app.use('/seguros', seguroRutas);
app.use('/cobertura', coberturaRouter);
app.use('/beneficio', beneficioRouter);
app.use('/requisito', requisitoRouter);
app.use('/contratos', contratoRouter);
app.use('/pagos', pagosRouter);  // ← monta todas las rutas definidas en pagos.rutas.js


// Para servir archivos estáticos (comprobantes subidos) en /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API en línea');
});

// Iniciar cron job
const { iniciarPagoScheduler } = require('./services/pagoScheduler');
iniciarPagoScheduler();

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor Express en http://localhost:${PORT}`);
});

// Manejo de errores de Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err);
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
