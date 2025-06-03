const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const { registrarPago, listarPagosCliente } = require('../../controllers/pago.controlador');

// POST: registrar un nuevo pago
router.post('/', upload.single('comprobante'), registrarPago);

// GET: historial de pagos por cliente
router.get('/cliente/:id_usuario', listarPagosCliente);

module.exports = router;
