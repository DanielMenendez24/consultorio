const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.query('SELECT ci, estado FROM paciente', (err, results) => {
    if (err) {
        console.error('Error fetching patients:', err);
    } else {
        console.log('Patients:', results);
    }

    connection.query('SELECT ci, estado FROM medico', (err, results) => {
        if (err) {
            console.error('Error fetching doctors:', err);
        } else {
            console.log('Doctors:', results);
        }
        connection.end();
    });
});
