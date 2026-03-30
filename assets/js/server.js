require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '31011007',
    database: process.env.DB_NAME || 'consultorio'
});

pool.getConnection((err, conn) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.get('/paciente', (req, res) => {
    const sql = `
        SELECT
            p.idPaciente,
            p.ci,
            CONCAT(persona.apellidoP, ', ', persona.nombreP) AS Paciente,
            persona.sexo,
            persona.fechaNac,
            CONCAT(persona.departamento, ', ', persona.ciudad, ', ', persona.barrio, ', ', persona.calle, ' ', persona.nroApartamento) AS Direccion,
            p.tipoSangre
        FROM paciente p
        JOIN persona on p.ci = persona.ci
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.get('/paciente/:ci', (req, res) => {
    const sql = `
        SELECT
            p.idPaciente,
            p.ci,
            CONCAT(persona.apellidoP, ', ', persona.nombreP) AS Paciente,
            persona.sexo,
            persona.fechaNac,
            CONCAT(persona.departamento, ', ', persona.ciudad, ', ', persona.barrio, ', ', persona.calle, ' ', persona.nroApartamento) AS Direccion,
            p.tipoSangre
        FROM paciente p
        JOIN persona on p.ci = persona.ci
        WHERE p.ci = ?
    `;
    const ci = req.params.ci;
    pool.query(sql, [ci], (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.get('/medico', (req, res) => {
    const sql = `
        SELECT
            m.nroLicencia,
            m.ci,
            CONCAT(persona.apellidoP, ', ', persona.nombreP) AS Paciente,
            persona.sexo,
            persona.fechaNac,
            CONCAT(persona.departamento, ', ', persona.ciudad, ', ', persona.barrio, ', ', persona.calle, ' ', persona.nroApartamento) AS Direccion,
            m.especialidad
        FROM medico m
        JOIN persona on m.ci = persona.ci
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.get('/medico/:ci', (req, res) => {
    const sql = `
        SELECT
            m.nroLicencia,
            m.ci,
            CONCAT(persona.apellidoP, ', ', persona.nombreP) AS Paciente,
            persona.sexo,
            persona.fechaNac,
            CONCAT(persona.departamento, ', ', persona.ciudad, ', ', persona.barrio, ', ', persona.calle, ' ', persona.nroApartamento) AS Direccion,
            m.especialidad
        FROM medico m
        JOIN persona on m.ci = persona.ci
        WHERE m.ci = ?
    `;
    const ci = req.params.ci;
    pool.query(sql, [ci], (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.get('/turno', (req, res) => {
    const sql = `
        SELECT 
            CONCAT(c.fechaConsulta, ', ', c.horaConsulta) AS 'FechaHora',
            CONCAT(p_paciente.apellidoP, ', ', p_paciente.nombreP) AS 'Paciente',
            CONCAT(p_medico.apellidoP, ', ', p_medico.nombreP) AS 'Medico',
            m.especialidad AS 'Especialidad',
            c.motivoConsulta AS 'Motivo',
            c.observaciones AS 'Observaciones',
            c.estado AS 'Estado'
        FROM consulta c
        JOIN paciente pac ON c.idPaciente = pac.idPaciente
        JOIN persona p_paciente ON pac.ci = p_paciente.ci
        JOIN medico m ON c.nroLicencia = m.nroLicencia
        JOIN persona p_medico ON m.ci = p_medico.ci
        ORDER BY c.fechaConsulta
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.get('/turno/:ci', (req, res) => {
    const sql = `
        SELECT 
            CONCAT(c.fechaConsulta, ', ', c.horaConsulta) AS 'FechaHora',
            CONCAT(p_paciente.apellidoP, ', ', p_paciente.nombreP) AS 'Paciente',
            CONCAT(p_medico.apellidoP, ', ', p_medico.nombreP) AS 'Medico',
            m.especialidad AS 'Especialidad',
            c.motivoConsulta AS 'Motivo',
            c.observaciones AS 'Observaciones',
            c.estado AS 'Estado'
        FROM consulta c
        JOIN paciente pac ON c.idPaciente = pac.idPaciente
        JOIN persona p_paciente ON pac.ci = p_paciente.ci
        JOIN medico m ON c.nroLicencia = m.nroLicencia
        JOIN persona p_medico ON m.ci = p_medico.ci
        WHERE pac.ci = ? OR m.ci = ?
        ORDER BY c.fechaConsulta
    `;
    const ci = req.params.ci;
    pool.query(sql, [ci, ci], (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});