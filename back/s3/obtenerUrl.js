//instalar -> npm install @aws-sdk/s3-request-presigner
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require('./s3client');
require("dotenv").config();


async function obtenerUrlArchivo (nombreArchivo) {
  const comando = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: nombreArchivo,
  });

  const url = await getSignedUrl(s3, comando, { expiresIn: 60 }); // segundos

  return url;
};

module.exports = obtenerUrlArchivo;