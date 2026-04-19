const mysql = require('mysql2');
require('dotenv').config({ path: './assets/js/.env' });

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-denn241198-daniel-2636.d.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'AVNS_clfMnmRknpxv5SOGJEA',
    database: process.env.DB_NAME || 'consultorio',
    port: process.env.DB_PORT || 20155
});

connection.query('SELECT * FROM consulta', (err, results) => {
    if (err) {
        console.error('Error fetching appointments:', err);
    } else {
        console.log('Appointments:', results);
    }
    connection.end();
});
