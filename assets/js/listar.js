document.addEventListener('DOMContentLoaded', () => {
    const tbodyPacientes = document.getElementById('pacientes-tbody');
    const tbodyMedicos = document.getElementById('medicos-tbody');
    const tbodyTurnos = document.getElementById('turnos-tbody');
    
    // Si no estamos en ninguna vista de lista, no hacer nada
    if (!tbodyPacientes && !tbodyMedicos && !tbodyTurnos) return;

    let isMedicos = tbodyMedicos !== null;
    let isTurnos = tbodyTurnos !== null;
    let isPacientes = tbodyPacientes !== null;

    let tbody = null;
    let pathBase = '';
    let itemName = '';

    if (isPacientes) { tbody = tbodyPacientes; pathBase = 'paciente'; itemName = 'pacientes'; }
    if (isMedicos) { tbody = tbodyMedicos; pathBase = 'medico'; itemName = 'médicos'; }
    if (isTurnos) { tbody = tbodyTurnos; pathBase = 'turno'; itemName = 'turnos'; }

    const renderTable = (data) => {
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="table-empty-message">No se encontraron ${itemName} registrados con esos criterios.</td></tr>`;
            return;
        }

        data.forEach(p => {
            const tr = document.createElement('tr');
            
            if (isTurnos) {
                const fechaHora = p.FechaHora || 'N/A';
                const paciente = p.Paciente || 'N/A';
                const medico = p.Medico || 'N/A';
                const especialidad = p.Especialidad || 'N/A';
                const motivo = p.Motivo || 'N/A';
                const obs = p.Observaciones || '';
                const estado = p.Estado || 'N/A';

                tr.innerHTML = `
                    <td>${fechaHora}</td>
                    <td>${paciente}</td>
                    <td>${medico}</td>
                    <td>${especialidad}</td>
                    <td>${motivo}</td>
                    <td>${obs}</td>
                    <td><span class="status-badge status-${(p.Estado || 'Pendiente').toLowerCase()}">${p.Estado || 'Pendiente'}</span></td>
                `;
            } else {
                const idCol = isMedicos ? (p.nroLicencia || 'N/A') : (p.idPaciente || 'N/A');
                const documento = p.ci || 'N/A';
                const nombre = p.Paciente || 'N/A'; // el alias del SQL
                const sexo = p.sexo || 'N/A';
                
                let fecha = p.fechaNac || 'N/A';
                if (fecha !== 'N/A' && typeof fecha === 'string' && fecha.includes('T')) {
                    fecha = new Date(fecha).toLocaleDateString('es-ES');
                }
                
                const direccion = p.Direccion || 'N/A';
                const telefono = p.telefono || 'N/A';
                const attrEspecial = isMedicos ? (p.especialidad || 'N/A') : (p.tipoSangre || 'N/A');

                tr.innerHTML = `
                    <td>${idCol}</td>
                    <td>${documento}</td>
                    <td>${nombre}</td>
                    <td>${sexo}</td>
                    <td>${fecha}</td>
                    <td>${direccion}</td>
                    <td>${telefono}</td>
                    <td>${attrEspecial}</td>
                    <td><span class="status-badge status-${(p.estado || 'Alta').toLowerCase()}">${p.estado || 'Alta'}</span></td>
                `;
            }
            tbody.appendChild(tr);
        });
    };

    const fetchData = async (ci = null) => {
        try {
            tbody.innerHTML = `<tr><td colspan="8" class="table-empty-message">⏳ Buscando registros...</td></tr>`;
            
            const url = ci ? `http://localhost:3000/${pathBase}/${ci}` : `http://localhost:3000/${pathBase}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('No se pudo conectar al Backend Express');
            }
            
            const data = await response.json();
            renderTable(data);
            
        } catch (error) {
            console.error('Error del servidor:', error);
            tbody.innerHTML = `<tr><td colspan="8" class="table-empty-message" style="color: #ef4444;">
                <strong>Error: No se pudo conectar a la base de datos MySQL.</strong><br><br>
                Asegúrate de tener el backend corriendo. Abre una terminal y ejecuta:<br>
                <code>node assets/js/server.js</code>
            </td></tr>`;
        }
    };

    fetchData();

    document.addEventListener('valid-search', (e) => {
        const ciBuscada = e.detail.ci;
        fetchData(ciBuscada);
    });

    const searchInput = document.getElementById('search-ci');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.trim() === '') {
                fetchData();
            }
        });
    }
});
