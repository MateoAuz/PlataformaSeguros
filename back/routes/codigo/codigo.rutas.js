const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /enviar-codigo
router.post('/', async (req, res) => {
  const { correoDestino, codigo } = req.body;

  if (!correoDestino || !codigo) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'holasboring@gmail.com',      
        pass: 'laww guzb vcsu suie'           
      }
    });

    const info = await transporter.sendMail({
      from: '"Plataforma Vida Plena" <holasboring@gmail.com>',
      to: correoDestino,
      subject: 'Código de verificación',
      text: `Tu código de verificación es: ${codigo}`
    });

    res.status(200).json({ ok: true, mensaje: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
});

module.exports = router;
