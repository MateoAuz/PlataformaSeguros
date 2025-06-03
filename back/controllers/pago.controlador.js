const fs = require('fs');
const subirArchivo = require('../s3/subirArchivo');
const db = require('../db/connection');

const registrarPago = async (req, res) => {
  const { id_usuario_seguro_per, cantidad } = req.body;
  const archivo = req.file;

  if (!archivo) {
    return res.status(400).json({ mensaje: 'El comprobante es obligatorio' });
  }

  try {
    const [seguro] = await db.query(`
      SELECT s.precio, u.username
      FROM usuario_seguro us
      JOIN seguro s ON us.id_seguro_per = s.id_seguro
      JOIN usuario u ON us.id_usuario_per = u.id_usuario
      WHERE us.id_usuario_seguro = ?
    `, [id_usuario_seguro_per]);

    if (!seguro) {
      return res.status(404).json({ mensaje: 'Contrato no encontrado' });
    }

    const precio = parseFloat(seguro.precio);
    const monto = parseFloat(cantidad);
    const nombreUsuario = seguro.username;
    const nombreArchivoS3 = `${Date.now()}-${archivo.originalname.replace(/\s+/g, '')}`;

    // Subir archivo a AWS S3
    await subirArchivo(archivo.path, nombreArchivoS3, nombreUsuario);

    // Eliminar el archivo temporal local
    fs.unlinkSync(archivo.path);

    const rutaComprobante = `${nombreUsuario}/${nombreArchivoS3}`;

    await db.query(`
      INSERT INTO pago_seguro (id_usuario_seguro_per, fecha_pago, cantidad, comprobante_pago)
      VALUES (?, CURDATE(), ?, ?)
    `, [id_usuario_seguro_per, monto, rutaComprobante]);

    res.json({ mensaje: 'Pago registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar pago:', err);
    res.status(500).json({ mensaje: 'Error interno al registrar el pago' });
  }
};

const listarPagosCliente = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const pagos = await db.query(`
      SELECT ps.*, s.nombre, s.precio
      FROM pago_seguro ps
      JOIN usuario_seguro us ON ps.id_usuario_seguro_per = us.id_usuario_seguro
      JOIN seguro s ON us.id_seguro_per = s.id_seguro
      WHERE us.id_usuario_per = ?
      ORDER BY ps.fecha_pago DESC
    `, [id_usuario]);

    res.json(pagos);
  } catch (err) {
    console.error('Error al listar pagos:', err);
    res.status(500).json({ mensaje: 'Error interno al listar pagos' });
  }
};

module.exports = {
  registrarPago,
  listarPagosCliente
};
