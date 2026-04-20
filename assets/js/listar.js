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

    let currentFilter = isTurnos ? 'past' : '';

    const renderTable = (data) => {
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="table-empty-message">No se encontraron ${itemName} registrados con esos criterios.</td></tr>`;
            return;
        }

        data.forEach((p, index) => {
            const tr = document.createElement('tr');
            tr.className = 'fade-in-up';
            tr.style.animationDelay = `${index * 50}ms`;
            
            if (isTurnos) {
                const fechaHora = p.FechaHora || 'N/A';
                const paciente = p.Paciente || 'N/A';
                const medico = p.Medico || 'N/A';
                const especialidad = p.Especialidad || 'N/A';
                const motivo = p.Motivo || 'N/A';
                const obs = p.Observaciones || '';
                const estado = p.Estado || 'N/A';

                tr.innerHTML = `
                    <td data-label="Fecha y hora">${fechaHora}</td>
                    <td data-label="Paciente">${paciente}</td>
                    <td data-label="Médico">${medico}</td>
                    <td data-label="Especialidad">${especialidad}</td>
                    <td data-label="Motivo">${motivo}</td>
                    <td data-label="Observaciones">${obs}</td>
                    <td data-label="Estado"><span class="status-badge status-${(p.Estado || 'Pendiente').toLowerCase()}">${p.Estado || 'Pendiente'}</span></td>
                    <td data-label="Acciones">
                        ${p.Estado === 'Pendiente' ? `
                            <a href="reg_turnos.html?ci=${p.ciPaciente || ''}&fecha=${p.fechaConsulta || ''}" class="btn-modify-inline">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                                Modificar
                            </a>
                        ` : '<span class="text-muted" style="font-size: 0.75rem; opacity: 0.6;">No modificable</span>'}
                    </td>
                `;
            } else {
                const idCol = isMedicos ? (p.nroLicencia || 'N/A') : (p.idPaciente || 'N/A');
                const documento = p.ci || 'N/A';
                const nombre = p.Paciente || p.nombre || 'N/A'; // el alias del SQL
                const sexo = p.sexo || 'N/A';
                
                let fecha = p.fechaNac || 'N/A';
                if (fecha !== 'N/A' && typeof fecha === 'string' && fecha.includes('T')) {
                    fecha = new Date(fecha).toLocaleDateString('es-ES');
                }
                
                const direccion = p.Direccion || 'N/A';
                const telefono = p.telefono || 'N/A';
                const attrEspecial = isMedicos ? (p.especialidad || 'N/A') : (p.tipoSangre || 'N/A');

                const attrLabel = isMedicos ? "Especialidad" : "Sangre";
                const targetPage = isMedicos ? "reg_medicos.html" : "reg_pacientes.html";

                tr.innerHTML = `
                    <td data-label="ID">${idCol}</td>
                    <td data-label="Documento">${documento}</td>
                    <td data-label="Nombre">${nombre}</td>
                    <td data-label="Sexo">${sexo}</td>
                    <td data-label="Fecha Nac.">${fecha}</td>
                    <td data-label="Dirección">${direccion}</td>
                    <td data-label="Teléfono">${telefono}</td>
                    <td data-label="${attrLabel}">${attrEspecial}</td>
                    <td data-label="Estado"><span class="status-badge status-${(p.estado || 'Alta').toLowerCase()}">${p.estado || 'Alta'}</span></td>
                    <td data-label="Acciones">
                        <a href="${targetPage}?ci=${documento}" class="btn-modify-inline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                            Modificar
                        </a>
                    </td>
                `;
            }
            tbody.appendChild(tr);
        });
    };

    const fetchData = async (ci = null) => {
        try {
            // Mostrar Skeleton Rows
            tbody.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const skeletonTr = document.createElement('tr');
                skeletonTr.innerHTML = `
                    <td colspan="8">
                        <div class="skeleton" style="width: 100%; height: 20px;"></div>
                    </td>
                `;
                tbody.appendChild(skeletonTr);
            }
            
            let url = ci ? `/${pathBase}/${ci}` : `/${pathBase}`;
            
            if (isTurnos && currentFilter) {
                url += (url.includes('?') ? '&' : '?') + `filter=${currentFilter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
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

    // Event listeners for filter buttons (specifically for Turnos)
    const filterButtons = document.querySelectorAll('.btn-filter-toggle');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            const searchInput = document.getElementById('search-ci');
            fetchData(searchInput && searchInput.value.trim() !== '' ? searchInput.value.trim() : null);
        });
    });
});

