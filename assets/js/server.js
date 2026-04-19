require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql-denn241198-daniel-2636.d.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'AVNS_clfMnmRknpxv5SOGJEA',
    database: process.env.DB_NAME || 'consultorio',
    port: process.env.DB_PORT || 20155
});

pool.getConnection((err, conn) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
    // Initial update on startup
    autoUpdateExpiredTurnos();
});

// Logic to automatically update expired appointments to 'Realizada'
function autoUpdateExpiredTurnos() {
    const sql = `
        UPDATE consulta 
        SET estado = 'Realizada' 
        WHERE (estado = 'Pendiente' OR estado = 'Confirmada' OR estado IS NULL) 
        AND TIMESTAMP(fechaConsulta, horaConsulta) < DATE_SUB(NOW(), INTERVAL 3 HOUR)
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating expired turnos:', err);
            return;
        }
        if (result.affectedRows > 0) {
            console.log(`[Auto-Update] ${result.affectedRows} turnos actualizados a 'Realizada'`);
        }
    });
}

// Check for expired appointments every 60 seconds
setInterval(autoUpdateExpiredTurnos, 60000);

app.get('/paciente', (req, res) => {
    const sql = `
        SELECT
            p.idPaciente,
            p.ci,
            CONCAT(persona.apellidoP, ', ', persona.nombreP) AS Paciente,
            persona.sexo,
            persona.fechaNac,
            CONCAT(persona.departamento, ', ', persona.ciudad, ', ', persona.barrio, ', ', persona.calle, ' ', persona.nroApartamento) AS Direccion,
            GROUP_CONCAT(t.telefono SEPARATOR ', ') AS telefono,
            p.tipoSangre,
            p.estado
        FROM paciente p
        JOIN persona on p.ci = persona.ci
        LEFT JOIN tel_persona t ON p.ci = t.ci
        WHERE p.estado = 'Alta'
        GROUP BY p.idPaciente, p.ci, persona.apellidoP, persona.nombreP, persona.sexo, persona.fechaNac, persona.departamento, persona.ciudad, persona.barrio, persona.calle, persona.nroApartamento, p.tipoSangre, p.estado
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
            GROUP_CONCAT(t.telefono SEPARATOR ', ') AS telefono,
            p.tipoSangre,
            p.estado
        FROM paciente p
        JOIN persona on p.ci = persona.ci
        LEFT JOIN tel_persona t ON p.ci = t.ci
        WHERE p.ci = ? AND p.estado = 'Alta'
        GROUP BY p.idPaciente, p.ci, persona.apellidoP, persona.nombreP, persona.sexo, persona.fechaNac, persona.departamento, persona.ciudad, persona.barrio, persona.calle, persona.nroApartamento, p.tipoSangre, p.estado
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
            GROUP_CONCAT(t.telefono SEPARATOR ', ') AS telefono,
            m.especialidad,
            m.estado
        FROM medico m
        JOIN persona on m.ci = persona.ci
        LEFT JOIN tel_persona t ON m.ci = t.ci
        WHERE m.estado = 'Alta'
        GROUP BY m.nroLicencia, m.ci, persona.apellidoP, persona.nombreP, persona.sexo, persona.fechaNac, persona.departamento, persona.ciudad, persona.barrio, persona.calle, persona.nroApartamento, m.especialidad, m.estado
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
            GROUP_CONCAT(t.telefono SEPARATOR ', ') AS telefono,
            m.especialidad,
            m.estado
        FROM medico m
        JOIN persona on m.ci = persona.ci
        LEFT JOIN tel_persona t ON m.ci = t.ci
        WHERE m.ci = ? AND m.estado = 'Alta'
        GROUP BY m.nroLicencia, m.ci, persona.apellidoP, persona.nombreP, persona.sexo, persona.fechaNac, persona.departamento, persona.ciudad, persona.barrio, persona.calle, persona.nroApartamento, m.especialidad, m.estado
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

app.get('/especialidad', (req, res) => {
    const sql = "SELECT DISTINCT especialidad FROM medico WHERE estado = 'Alta' ORDER BY especialidad";
    pool.query(sql, (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result.map(row => row.especialidad));
    });
});

app.get('/medico/especialidad/:especialidad', (req, res) => {
    const sql = `
        SELECT 
            m.ci, 
            CONCAT(p.apellidoP, ', ', p.nombreP) AS nombre,
            m.nroLicencia
        FROM medico m
        JOIN persona p ON m.ci = p.ci
        WHERE m.especialidad = ? AND m.estado = 'Alta'
        ORDER BY p.apellidoP, p.nombreP
    `;
    const especialidad = req.params.especialidad;
    pool.query(sql, [especialidad], (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.get('/turno', (req, res) => {
    const filter = req.query.filter;
    let whereClause = '';
    if (filter === 'past') {
        whereClause = "WHERE c.estado IN ('Realizada', 'Cancelada')";
    } else if (filter === 'future') {
        whereClause = "WHERE c.estado = 'Pendiente'";
    }

    const sql = `
        SELECT 
            CONCAT(c.fechaConsulta, ', ', c.horaConsulta) AS 'FechaHora',
            CONCAT(p_paciente.apellidoP, ', ', p_paciente.nombreP) AS 'Paciente',
            CONCAT(p_medico.apellidoP, ', ', p_medico.nombreP) AS 'Medico',
            m.especialidad AS 'Especialidad',
            c.motivoConsulta AS 'Motivo',
            c.observaciones AS 'Observaciones',
            c.estado AS 'Estado',
            pac.ci AS 'ciPaciente',
            c.fechaConsulta AS 'fechaConsulta'
        FROM consulta c
        JOIN paciente pac ON c.idPaciente = pac.idPaciente
        JOIN persona p_paciente ON pac.ci = p_paciente.ci
        JOIN medico m ON c.nroLicencia = m.nroLicencia
        JOIN persona p_medico ON m.ci = p_medico.ci
        ${whereClause}
        ORDER BY c.fechaConsulta DESC
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
    const ci = req.params.ci;
    const filter = req.query.filter;
    let dateFilter = '';
    if (filter === 'past') {
        dateFilter = "AND c.estado IN ('Realizada', 'Cancelada')";
    } else if (filter === 'future') {
        dateFilter = "AND c.estado = 'Pendiente'";
    }

    const sql = `
        SELECT 
            CONCAT(c.fechaConsulta, ', ', c.horaConsulta) AS 'FechaHora',
            CONCAT(p_paciente.apellidoP, ', ', p_paciente.nombreP) AS 'Paciente',
            CONCAT(p_medico.apellidoP, ', ', p_medico.nombreP) AS 'Medico',
            m.especialidad AS 'Especialidad',
            c.motivoConsulta AS 'Motivo',
            c.observaciones AS 'Observaciones',
            c.estado AS 'Estado',
            pac.ci AS 'ciPaciente',
            c.fechaConsulta AS 'fechaConsulta'
        FROM consulta c
        JOIN paciente pac ON c.idPaciente = pac.idPaciente
        JOIN persona p_paciente ON pac.ci = p_paciente.ci
        JOIN medico m ON c.nroLicencia = m.nroLicencia
        JOIN persona p_medico ON m.ci = p_medico.ci
        WHERE (pac.ci = ? OR m.ci = ?) ${dateFilter}
        ORDER BY c.fechaConsulta DESC
    `;
    pool.query(sql, [ci, ci], (err, result) => {
        if (err) {
            console.error('Error en consulta SQL:', err);
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        res.json(result);
    });
});

app.get('/persona/:ci', (req, res) => {
    const sql = `
        SELECT p.*, GROUP_CONCAT(t.telefono SEPARATOR ', ') AS telefonos, pac.tipoSangre, med.especialidad, 
               COALESCE(pac.estado, med.estado) AS estado
        FROM persona p 
        LEFT JOIN tel_persona t ON p.ci = t.ci 
        LEFT JOIN paciente pac ON p.ci = pac.ci
        LEFT JOIN medico med ON p.ci = med.ci
        WHERE p.ci = ?
        GROUP BY p.ci, pac.tipoSangre, med.especialidad, pac.estado, med.estado
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

app.post('/paciente', (req, res) => {
    const { ci, nombre, apellido, fechaNacimiento, sexo, departamento, ciudad, barrio, calle, numeroPuerta, tipoSangre, telPersona } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error('Transaction start failed:', err);
                return res.status(500).json({ error: 'Transaction start failed' });
            }

            // Verificar si la persona ya existe
            connection.query('SELECT ci FROM persona WHERE ci = ?', [ci], (err, rows) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: 'Error al verificar persona', details: err.message });
                    });
                }

                const personExists = rows.length > 0;

                const finishRegistration = () => {
                    // Verificar si ya es paciente
                    connection.query('SELECT ci FROM paciente WHERE ci = ?', [ci], (err, pRows) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: 'Error al verificar paciente', details: err.message });
                            });
                        }

                        if (pRows.length > 0) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(400).json({ error: 'Esta persona ya está registrada como paciente' });
                            });
                        }

                        const sqlPaciente = `INSERT INTO paciente (idPaciente, ci, tipoSangre, estado) VALUES (0, ?, ?, 'Alta')`;
                        connection.query(sqlPaciente, [ci, tipoSangre], (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: 'Error al insertar en paciente', details: err.message });
                                });
                            }

                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: 'Error al confirmar transacción' });
                                    });
                                }
                                connection.release();
                                res.status(201).json({ message: 'Paciente registrado exitosamente' });
                            });
                        });
                    });
                };

                if (personExists) {
                    finishRegistration();
                } else {
                    const sqlPersona = `INSERT INTO persona (ci, nombreP, apellidoP, fechaNac, sexo, departamento, ciudad, barrio, calle, nroApartamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(sqlPersona, [ci, nombre, apellido, fechaNacimiento, sexo, departamento, ciudad, barrio, calle, numeroPuerta], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: 'Error al insertar en persona', details: err.message });
                            });
                        }

                        const phones = (telPersona || '').split(',').map(p => p.trim()).filter(p => p.length > 0);
                        if (phones.length > 0) {
                            const phoneValues = phones.map(p => [p, ci]);
                            const sqlTel = `INSERT INTO tel_persona (telefono, ci) VALUES ?`;
                            connection.query(sqlTel, [phoneValues], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: 'Error al insertar teléfonos', details: err.message });
                                    });
                                }
                                finishRegistration();
                            });
                        } else {
                            finishRegistration();
                        }
                    });
                }
            });
        });
    });
});

app.post('/medico', (req, res) => {
    const { ci, nombre, apellido, fechaNacimiento, sexo, departamento, ciudad, barrio, calle, numeroPuerta, especialidad, telPersona } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error('Transaction start failed:', err);
                return res.status(500).json({ error: 'Transaction start failed' });
            }

            // Verificar si la persona ya existe
            connection.query('SELECT ci FROM persona WHERE ci = ?', [ci], (err, rows) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: 'Error al verificar persona', details: err.message });
                    });
                }

                const personExists = rows.length > 0;

                const finishRegistration = () => {
                    // Verificar si ya es médico
                    connection.query('SELECT ci FROM medico WHERE ci = ?', [ci], (err, mRows) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: 'Error al verificar médico', details: err.message });
                            });
                        }

                        if (mRows.length > 0) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(400).json({ error: 'Esta persona ya está registrada como médico' });
                            });
                        }

                        const sqlMedico = `INSERT INTO medico (nroLicencia, ci, especialidad, estado) VALUES (0, ?, ?, 'Alta')`;
                        connection.query(sqlMedico, [ci, especialidad], (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: 'Error al insertar en médico', details: err.message });
                                });
                            }

                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: 'Error al confirmar transacción' });
                                    });
                                }
                                connection.release();
                                res.status(201).json({ message: 'Médico registrado exitosamente' });
                            });
                        });
                    });
                };

                if (personExists) {
                    finishRegistration();
                } else {
                    const sqlPersona = `INSERT INTO persona (ci, nombreP, apellidoP, fechaNac, sexo, departamento, ciudad, barrio, calle, nroApartamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(sqlPersona, [ci, nombre, apellido, fechaNacimiento, sexo, departamento, ciudad, barrio, calle, numeroPuerta], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: 'Error al insertar en persona', details: err.message });
                            });
                        }

                        const phones = (telPersona || '').split(',').map(p => p.trim()).filter(p => p.length > 0);
                        if (phones.length > 0) {
                            const phoneValues = phones.map(p => [p, ci]);
                            const sqlTel = `INSERT INTO tel_persona (telefono, ci) VALUES ?`;
                            connection.query(sqlTel, [phoneValues], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: 'Error al insertar teléfonos', details: err.message });
                                    });
                                }
                                finishRegistration();
                            });
                        } else {
                            finishRegistration();
                        }
                    });
                }
            });
        });
    });
});

app.put('/paciente/:ci', (req, res) => {
    const originalCi = req.params.ci;
    const data = req.body;

    pool.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: 'Database connection failed' });

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Transaction start failed' });
            }

            const updatePersona = (callback) => {
                const personaFields = {};
                if (data.ci) personaFields.ci = data.ci;
                if (data.nombre) personaFields.nombreP = data.nombre;
                if (data.apellido) personaFields.apellidoP = data.apellido;
                if (data.fechaNacimiento) personaFields.fechaNac = data.fechaNacimiento;
                if (data.sexo) personaFields.sexo = data.sexo;
                if (data.departamento) personaFields.departamento = data.departamento;
                if (data.ciudad) personaFields.ciudad = data.ciudad;
                if (data.barrio) personaFields.barrio = data.barrio;
                if (data.calle) personaFields.calle = data.calle;
                if (data.numeroPuerta) personaFields.nroApartamento = data.numeroPuerta;

                if (Object.keys(personaFields).length > 0) {
                    connection.query('UPDATE persona SET ? WHERE ci = ?', [personaFields, originalCi], callback);
                } else {
                    callback(null);
                }
            };

            const updateTel = (callback) => {
                if (data.telPersona !== undefined) {
                    connection.query('DELETE FROM tel_persona WHERE ci = ?', [originalCi], (err) => {
                        if (err) return callback(err);
                        const phones = data.telPersona.split(',').map(p => p.trim()).filter(p => p.length > 0);
                        if (phones.length > 0) {
                            const phoneValues = phones.map(p => [p, data.ci || originalCi]);
                            connection.query('INSERT INTO tel_persona (telefono, ci) VALUES ?', [phoneValues], callback);
                        } else {
                            callback(null);
                        }
                    });
                } else {
                    callback(null);
                }
            };

            const updatePaciente = (callback) => {
                const pacienteFields = {};
                if (data.tipoSangre) pacienteFields.tipoSangre = data.tipoSangre;
                if (data.ci) pacienteFields.ci = data.ci;

                if (Object.keys(pacienteFields).length > 0) {
                    connection.query('UPDATE paciente SET ? WHERE ci = ?', [pacienteFields, originalCi], callback);
                } else {
                    callback(null);
                }
            };

            updatePersona((err) => {
                if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Error updating persona', details: err.message }); });
                updateTel((err) => {
                    if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Error updating phone', details: err.message }); });
                    updatePaciente((err) => {
                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Error updating paciente', details: err.message }); });

                        connection.commit(err => {
                            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Commit failed' }); });
                            connection.release();
                            res.status(200).json({ message: 'Datos modificados exitosamente' });
                        });
                    });
                });
            });
        });
    });
});

app.put('/medico/:ci', (req, res) => {
    const originalCi = req.params.ci;
    const data = req.body;

    pool.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: 'Database connection failed' });

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Transaction start failed' });
            }

            const updatePersona = (callback) => {
                const personaFields = {};
                if (data.ci) personaFields.ci = data.ci;
                if (data.nombre) personaFields.nombreP = data.nombre;
                if (data.apellido) personaFields.apellidoP = data.apellido;
                if (data.fechaNacimiento) personaFields.fechaNac = data.fechaNacimiento;
                if (data.sexo) personaFields.sexo = data.sexo;
                if (data.departamento) personaFields.departamento = data.departamento;
                if (data.ciudad) personaFields.ciudad = data.ciudad;
                if (data.barrio) personaFields.barrio = data.barrio;
                if (data.calle) personaFields.calle = data.calle;
                if (data.numeroPuerta) personaFields.nroApartamento = data.numeroPuerta;

                if (Object.keys(personaFields).length > 0) {
                    connection.query('UPDATE persona SET ? WHERE ci = ?', [personaFields, originalCi], callback);
                } else {
                    callback(null);
                }
            };

            const updateTel = (callback) => {
                if (data.telPersona !== undefined) {
                    connection.query('DELETE FROM tel_persona WHERE ci = ?', [originalCi], (err) => {
                        if (err) return callback(err);
                        const phones = data.telPersona.split(',').map(p => p.trim()).filter(p => p.length > 0);
                        if (phones.length > 0) {
                            const phoneValues = phones.map(p => [p, data.ci || originalCi]);
                            connection.query('INSERT INTO tel_persona (telefono, ci) VALUES ?', [phoneValues], callback);
                        } else {
                            callback(null);
                        }
                    });
                } else {
                    callback(null);
                }
            };

            const updateMedico = (callback) => {
                const medicoFields = {};
                if (data.especialidad) medicoFields.especialidad = data.especialidad;
                if (data.ci) medicoFields.ci = data.ci;

                if (Object.keys(medicoFields).length > 0) {
                    connection.query('UPDATE medico SET ? WHERE ci = ?', [medicoFields, originalCi], callback);
                } else {
                    callback(null);
                }
            };

            updatePersona((err) => {
                if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Error updating persona', details: err.message }); });
                updateTel((err) => {
                    if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Error updating phone', details: err.message }); });
                    updateMedico((err) => {
                        if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Error updating medico', details: err.message }); });

                        connection.commit(err => {
                            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: 'Commit failed' }); });
                            connection.release();
                            res.status(200).json({ message: 'Datos modificados exitosamente' });
                        });
                    });
                });
            });
        });
    });
});

app.post('/turno', (req, res) => {
    const { ciPaciente, ciMedico, fecha, hora, motivo, observaciones, estado } = req.body;

    // 1. Get idPaciente from CI
    pool.query('SELECT idPaciente FROM paciente WHERE ci = ?', [ciPaciente], (err, pResult) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos (Paciente)' });
        if (pResult.length === 0) return res.status(404).json({ error: 'No existe un paciente con esa CI' });

        const idPaciente = pResult[0].idPaciente;

        // 2. Get nroLicencia from CI
        pool.query('SELECT nroLicencia FROM medico WHERE ci = ?', [ciMedico], (err, mResult) => {
            if (err) return res.status(500).json({ error: 'Error de base de datos (Médico)' });
            if (mResult.length === 0) return res.status(404).json({ error: 'No existe un médico con esa CI' });

            const nroLicencia = mResult[0].nroLicencia;

            // 3. Insert into consulta (Always default to Pendiente)


            const sql = `INSERT INTO consulta (fechaConsulta, horaConsulta, idPaciente, nroLicencia, motivoConsulta, observaciones, estado) 


                         VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')`;


            pool.query(sql, [fecha, hora, idPaciente, nroLicencia, motivo, observaciones], (err, result) => {
                if (err) {
                    console.error('Error al registrar turno:', err);
                    return res.status(500).json({ error: 'Error al registrar turno', details: err.message });
                }
                res.status(201).json({
                    message: 'Turno registrado exitosamente',
                    idConsulta: result.insertId
                });
            });
        });
    });
});

app.get('/turno/search/:ciPaciente/:fecha', (req, res) => {
    const { ciPaciente, fecha } = req.params;
    const sql = `
        SELECT c.*, p_medico.ci as ciMedico, 
               CONCAT(p_paciente.apellidoP, ', ', p_paciente.nombreP) as Paciente,
               CONCAT(p_medico.apellidoP, ', ', p_medico.nombreP) as Medico
        FROM consulta c
        JOIN paciente pac ON c.idPaciente = pac.idPaciente
        JOIN persona p_paciente ON pac.ci = p_paciente.ci
        JOIN medico m ON c.nroLicencia = m.nroLicencia
        JOIN persona p_medico ON m.ci = p_medico.ci
        WHERE pac.ci = ? AND c.fechaConsulta = ?
        LIMIT 1
    `;
    pool.query(sql, [ciPaciente, fecha], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });
        res.json(result);
    });
});

app.put('/turno/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body; // Field mapping happens here

    const fields = {};
    if (data.fecha) fields.fechaConsulta = data.fecha;
    if (data.hora) fields.horaConsulta = data.hora;
    if (data.motivo) fields.motivoConsulta = data.motivo;
    if (data.observaciones) fields.observaciones = data.observaciones;
    if (data.estado) fields.estado = data.estado;

    if (Object.keys(fields).length === 0) return res.status(400).json({ error: 'No fields to update' });

    pool.query('UPDATE consulta SET ? WHERE idConsulta = ?', [fields, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar turno', details: err.message });
        res.status(200).json({ message: 'Turno actualizado con éxito' });
    });
});

app.delete('/paciente/:ci', (req, res) => {
    const ci = req.params.ci;
    pool.query("UPDATE paciente SET estado = 'Baja' WHERE ci = ?", [ci], (err, result) => {
        if (err) {
            console.error('Error al dar de baja al paciente:', err);
            return res.status(500).json({ error: 'Error al dar de baja al paciente', details: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No se encontró el paciente' });
        res.status(200).json({ message: 'Paciente dado de baja con éxito' });
    });
});

app.patch('/paciente/reactivar/:ci', (req, res) => {
    const ci = req.params.ci;
    pool.query("UPDATE paciente SET estado = 'Alta' WHERE ci = ?", [ci], (err, result) => {
        if (err) {
            console.error('Error al dar de alta al paciente:', err);
            return res.status(500).json({ error: 'Error al dar de alta al paciente', details: err.message });
        }
        res.status(200).json({ message: 'Paciente reactivado con éxito' });
    });
});

app.delete('/medico/:ci', (req, res) => {
    const ci = req.params.ci;
    pool.query("UPDATE medico SET estado = 'Baja' WHERE ci = ?", [ci], (err, result) => {
        if (err) {
            console.error('Error al dar de baja al médico:', err);
            return res.status(500).json({ error: 'Error al dar de baja al médico', details: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No se encontró el médico' });
        res.status(200).json({ message: 'Médico dado de baja con éxito' });
    });
});

app.patch('/medico/reactivar/:ci', (req, res) => {
    const ci = req.params.ci;
    pool.query("UPDATE medico SET estado = 'Alta' WHERE ci = ?", [ci], (err, result) => {
        if (err) {
            console.error('Error al dar de alta al médico:', err);
            return res.status(500).json({ error: 'Error al dar de alta al médico', details: err.message });
        }
        res.status(200).json({ message: 'Médico reactivado con éxito' });
    });
});

app.delete('/turno/:id', (req, res) => {
    const id = req.params.id;
    pool.query("UPDATE consulta SET estado = 'Cancelada' WHERE idConsulta = ?", [id], (err, result) => {
        if (err) {
            console.error('Error al cancelar turno:', err);
            return res.status(500).json({ error: 'Error al cancelar turno', details: err.message });
        }
        if (result.affectedRows === 0) return res.status(404).json({ error: 'No se encontró el turno' });
        res.status(200).json({ message: 'Turno cancelado con éxito' });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});