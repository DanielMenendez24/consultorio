const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
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
