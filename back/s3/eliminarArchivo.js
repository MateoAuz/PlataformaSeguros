const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('./s3client');
require("dotenv").config();

async function eliminarArchivo(nombreArchivo) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: nombreArchivo,
  });

  await s3.send(command);
}

module.exports = eliminarArchivo;