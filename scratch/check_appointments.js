const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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
