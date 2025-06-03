const { ListObjectsV2Command } = require("@aws-sdk/client-s3");
const s3 = require('./s3client');

require("dotenv").config();


async function listarArchivos  ()  {
  const params = {
    Bucket: process.env.AWS_BUCKET,
  };

  const comando = new ListObjectsV2Command(params);
  const resultado = await s3.send(comando);

  // Solo los nombres de archivo
  return resultado.Contents.map(item => ({
    nombre: item.Key,
    tamaño: item.Size,
    ultimaModificacion: item.LastModified,
  }));
};

module.exports = listarArchivos;