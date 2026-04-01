const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '31011007',
    database: process.env.DB_NAME || 'consultorio'
});

connection.query('DESCRIBE paciente', (err, results) => {
    if (err) {
        console.error('Error describing paciente:', err);
    } else {
        console.log('Paciente structure:', results);
    }

    connection.query('DESCRIBE medico', (err, results) => {
        if (err) {
            console.error('Error describing medico:', err);
        } else {
            console.log('Medico structure:', results);
        }
        connection.end();
    });
});
