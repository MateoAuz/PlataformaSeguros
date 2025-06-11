const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const s3 = require('./s3client');
const path = require('path');

async function subirArchivo(pathLocal, nombreArchivo, nombreUsuario) {
  const archivo = fs.readFileSync(pathLocal);

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: `${nombreUsuario?.trim() || 'sin-usuario'}/${path.basename(nombreArchivo)}`,
    Body: archivo,
    ContentType: 'application/pdf',
  });

  await s3.send(command);
}

module.exports = subirArchivo;
