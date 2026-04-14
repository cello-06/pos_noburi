const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'db-noburi1-marcellosetiawan06-f531.e.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_gzq-ssaI8joLwnS_g6k',
    database: 'defaultdb',
    port: 10039,
    ssl: { rejectUnauthorized: false }, // Ini wajib ada untuk Aiven
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal koneksi ke database:', err.message);
  } else {
    console.log('✅ Berhasil terhubung ke database db_noburi');
    connection.release();
  }
});

module.exports = db.promise();
