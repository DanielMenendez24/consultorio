require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql-denn241198-daniel-2636.d.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD || 'AVNS_clfMnmRknpxv5SOGJEA',
    database: process.env.DB_NAME || 'consultorio',
    port: process.env.DB_PORT || 20155
});

async function runTest() {
    console.log("--- TEST: Auto-update expired turnos ---");

    try {
        // 1. Create a dummy appointment in the past if doesn't exist
        // We'll just look for one that is currently 'Pendiente' and in the past
        const checkSql = "SELECT * FROM consulta WHERE estado = 'Pendiente' AND TIMESTAMP(fechaConsulta, horaConsulta) < NOW() LIMIT 1";
        const [rows] = await pool.promise().query(checkSql);

        if (rows.length === 0) {
            console.log("No pending expired appointments found to test with.");
            console.log("Creating a temporary test appointment...");
            
            // To create one, we need a valid idPaciente and nroLicencia
            const [pac] = await pool.promise().query("SELECT idPaciente FROM paciente LIMIT 1");
            const [med] = await pool.promise().query("SELECT nroLicencia FROM medico LIMIT 1");

            if (pac.length > 0 && med.length > 0) {
                const insertSql = `
                    INSERT INTO consulta (fechaConsulta, horaConsulta, idPaciente, nroLicencia, motivoConsulta, estado)
                    VALUES (DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', ?, ?, 'Test Auto Update', 'Pendiente')
                `;
                await pool.promise().query(insertSql, [pac[0].idPaciente, med[0].nroLicencia]);
                console.log("Temporary expired appointment created.");
            } else {
                console.error("Could not create test appointment: No patients or doctors found.");
                process.exit(1);
            }
        }

        // 2. Run the update query (copied from server.js for validation)
        const updateSql = `
            UPDATE consulta 
            SET estado = 'Realizada' 
            WHERE (estado = 'Pendiente' OR estado = 'Confirmada' OR estado IS NULL) 
            AND TIMESTAMP(fechaConsulta, horaConsulta) < NOW()
        `;
        const [result] = await pool.promise().query(updateSql);
        console.log(`Update executed. Affected rows: ${result.affectedRows}`);

        // 3. Verify
        if (result.affectedRows > 0) {
            console.log("SUCCESS: Past appointments were updated to 'Realizada'.");
        } else {
            console.log("No appointments were updated (this might happen if they were already updated).");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        pool.end();
    }
}

runTest();
