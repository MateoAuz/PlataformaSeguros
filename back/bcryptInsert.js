const bcrypt = require('bcrypt');
const db = require('./db/connection');

const usuarios = [
  ['teoauz@gmail.com', 'MateoAuz', '1234', 'Mateo', 'Auz', 0, 1, '1234567890', '0987654321'],
  ['mauricioGuevara@gmail.com', 'MauricioGuevara', 'erica', 'Maurico', 'Guevara', 1, 1, '1808647634', '0987714718'],
  ['santiagoMora@gmail.com', 'SantioMora', 'donMora', 'Santiago', 'Mora', 1, 1, '1808123634', '0983507919'],
  ['holasboring@gmail.com', 'BorisRex', 'boris', 'Boris', 'Vinces', 2, 1, '1808647693', '0982414718']
];

(async () => {
  for (const u of usuarios) {
    const hashedPassword = await bcrypt.hash(u[2], 10);
    const sql = `
      INSERT INTO usuario (correo, username, password, nombre, apellido, tipo, activo, cedula, telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [u[0], u[1], hashedPassword, u[3], u[4], u[5], u[6], u[7], u[8]];

    db.query(sql, values, (err) => {
      if (err) console.error('❌ Error:', err);
      else console.log(`✅ Usuario insertado: ${u[1]}`);
    });
  }
})();
