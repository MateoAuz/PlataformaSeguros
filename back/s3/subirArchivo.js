const { PutObjectCommand} = require("@aws-sdk/client-s3");
const fs = require("fs");
const s3 = require('./s3client');

async function subirArchivo(pathLocal, nombreArchivo) {

  const archivo = fs.readFileSync(pathLocal);
  console.log(process.env.AWS_BUCKET);
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: nombreArchivo,
    Body: archivo,
    ContentType: 'application/pdf',
  });

  await s3.send(command);

}

module.exports = subirArchivo;