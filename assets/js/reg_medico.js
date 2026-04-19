document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-reg-medico');
    let originalData = null;

    if (form) {
        const btnModificar = document.getElementById('btn-modificar');
        const btnEliminar = document.getElementById('btn-eliminar');
        const ciInput = document.getElementById('ci');
        const ciContainer = document.getElementById('ci-container');
        const ciError = document.getElementById('ci-error');

        const showCiError = () => {
            if (ciContainer) ciContainer.classList.add('has-error');
            if (ciError) ciError.style.display = 'block';
        };
        const clearCiError = () => {
            if (ciContainer) ciContainer.classList.remove('has-error');
            if (ciError) ciError.style.display = 'none';
        };

        if (ciInput) {
            ciInput.addEventListener('input', () => {
                clearCiError();
                if (btnModificar) btnModificar.disabled = true;
                if (btnEliminar) btnEliminar.disabled = true;
            });

            const fetchAndFill = async (ci) => {
                if (ci && typeof esCedulaValida === 'function' && !esCedulaValida(ci)) {
                    showCiError();
                    return;
                }
                clearCiError();

                if (ci.length >= 7) {
                    try {
                        const response = await fetch(`http://localhost:3000/persona/${ci}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data && data.length > 0) {
                                const person = data[0];
                                document.getElementById('nombre').value = person.nombreP || '';
                                document.getElementById('apellido').value = person.apellidoP || '';
                                if (person.fechaNac) {
                                    const date = new Date(person.fechaNac);
                                    const formattedDate = date.toISOString().split('T')[0];
                                    document.getElementById('fechaNacimiento').value = formattedDate;
                                }
                                if (person.sexo) {
                                    form.elements['sexo'].value = person.sexo;
                                }
                                document.getElementById('departamento').value = person.departamento || '';
                                document.getElementById('ciudad').value = person.ciudad || '';
                                document.getElementById('barrio').value = person.barrio || '';
                                document.getElementById('calle').value = person.calle || '';
                                document.getElementById('numeroPuerta').value = person.nroApartamento || '';
                                document.getElementById('telPersona').value = person.telefonos || person.telefono || '';
                                if (person.especialidad) {
                                    document.getElementById('especialidad').value = person.especialidad;
                                }
                                if (person.estado) {
                                    document.getElementById('estado').value = person.estado;
                                    if (person.estado === 'Baja') {
                                        btnEliminar.textContent = 'Dar de Alta Médico';
                                        btnEliminar.style.backgroundColor = '#10b981';
                                        btnEliminar.style.borderColor = '#10b981';
                                    } else {
                                        btnEliminar.textContent = 'Eliminar Médico';
                                        btnEliminar.style.backgroundColor = 'var(--error-color, #ef4444)';
                                        btnEliminar.style.borderColor = 'var(--error-color, #ef4444)';
                                    }
                                }

                                if (btnModificar) btnModificar.disabled = !person.especialidad;
                                if (btnEliminar) btnEliminar.disabled = !person.especialidad;

                                // Store original data for diffing, handling nulls as empty strings
                                originalData = {
                                    ci: person.ci ? String(person.ci) : '',
                                    nombre: person.nombreP || '',
                                    apellido: person.apellidoP || '',
                                    fechaNacimiento: person.fechaNac ? new Date(person.fechaNac).toISOString().split('T')[0] : '',
                                    sexo: person.sexo || '',
                                    departamento: person.departamento || '',
                                    ciudad: person.ciudad || '',
                                    barrio: person.barrio || '',
                                    calle: person.calle || '',
                                    numeroPuerta: person.nroApartamento || '',
                                    telPersona: person.telefonos || person.telefono || '',
                                    especialidad: person.especialidad || '',
                                    estado: person.estado || 'Alta'
                                };
                            } else {
                                if (btnModificar) btnModificar.disabled = true;
                                if (btnEliminar) btnEliminar.disabled = true;
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching person data:', err);
                    }
                }
            };

            ciInput.addEventListener('blur', () => fetchAndFill(ciInput.value.trim()));

            // Check for CI in URL
            const urlParams = new URLSearchParams(window.location.search);
            const ciParam = urlParams.get('ci');
            if (ciParam) {
                ciInput.value = ciParam;
                fetchAndFill(ciParam);
            }
        }

        if (btnModificar) {
            btnModificar.addEventListener('click', async () => {
                const ciValue = ciInput.value.trim();
                const currentData = {
                    ci: ciValue,
                    nombre: document.getElementById('nombre').value.trim(),
                    apellido: document.getElementById('apellido').value.trim(),
                    fechaNacimiento: document.getElementById('fechaNacimiento').value,
                    sexo: form.elements['sexo'].value,
                    departamento: document.getElementById('departamento').value,
                    ciudad: document.getElementById('ciudad').value.trim(),
                    barrio: document.getElementById('barrio').value.trim(),
                    calle: document.getElementById('calle').value.trim(),
                    numeroPuerta: document.getElementById('numeroPuerta').value.trim(),
                    telPersona: document.getElementById('telPersona').value.trim(),
                    especialidad: document.getElementById('especialidad').value
                };

                // Filter only changed fields with robust comparison
                const updates = {};
                for (const key in currentData) {
                    const originalVal = originalData ? (originalData[key] || '') : '';
                    if (String(currentData[key]) !== String(originalVal)) {
                        updates[key] = currentData[key];
                    }
                }

                if (Object.keys(updates).length === 0) {
                    alert('No se detectaron cambios para modificar.');
                    return;
                }

                try {
                    const targetCi = originalData ? originalData.ci : ciValue;
                    const response = await fetch(`http://localhost:3000/medico/${targetCi}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });

                    if (response.ok) {
                        alert('¡Datos modificados con éxito!');
                        // Update originalData with new values to allow further edits
                        originalData = { ...originalData, ...updates };
                    } else {
                        const error = await response.json();
                        alert(`Error al modificar: ${error.details || error.error || 'Desconocido'}`);
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error al conectar con el servidor.');
                }
            });
        }

        if (btnEliminar) {
            btnEliminar.addEventListener('click', async () => {
                const ciValue = ciInput.value;
                if (!ciValue) return;

                const isBaja = document.getElementById('estado').value === 'Baja';

                if (isBaja) {
                    if (confirm(`¿Desea dar de ALTA nuevamente al médico con CI ${ciValue}?`)) {
                        try {
                            const response = await fetch(`http://localhost:3000/medico/reactivar/${ciValue}`, {
                                method: 'PATCH'
                            });
                            if (response.ok) {
                                alert('¡Médico reactivado con éxito!');
                                form.reset();
                                document.getElementById('estado').value = 'Alta';
                                btnEliminar.textContent = 'Eliminar Médico';
                                btnEliminar.style.backgroundColor = 'var(--error-color, #ef4444)';
                                btnEliminar.style.borderColor = 'var(--error-color, #ef4444)';
                                originalData = null;
                                if (btnModificar) btnModificar.disabled = true;
                                if (btnEliminar) btnEliminar.disabled = true;
                            } else {
                                const error = await response.json();
                                alert(`Error: ${error.error || 'Desconocido'}`);
                            }
                        } catch (err) { alert('Error al conectar con el servidor.'); }
                    }
                } else {
                    if (confirm(`¿Está seguro que desea dar de BAJA al médico con CI ${ciValue}? Esto cambiará su estado a 'Baja'.`)) {
                        try {
                            const response = await fetch(`http://localhost:3000/medico/${ciValue}`, {
                                method: 'DELETE'
                            });

                            if (response.ok) {
                                alert('¡Médico dado de baja con éxito!');
                                form.reset();
                                document.getElementById('estado').value = 'Alta';
                                originalData = null;
                                if (btnModificar) btnModificar.disabled = true;
                                if (btnEliminar) btnEliminar.disabled = true;
                            } else {
                                const error = await response.json();
                                alert(`Error al eliminar: ${error.details || error.error || 'Desconocido'}`);
                            }
                        } catch (err) { alert('Error al conectar con el servidor.'); }
                    }
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ciValue = document.getElementById('ci').value.trim();
            if (typeof esCedulaValida === 'function' && !esCedulaValida(ciValue)) {
                showCiError();
                document.getElementById('ci').focus();
                return;
            }

            const formData = {
                ci: document.getElementById('ci').value,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                sexo: form.elements['sexo'].value,
                departamento: document.getElementById('departamento').value,
                ciudad: document.getElementById('ciudad').value,
                barrio: document.getElementById('barrio').value,
                calle: document.getElementById('calle').value,
                numeroPuerta: document.getElementById('numeroPuerta').value,
                telPersona: document.getElementById('telPersona').value,
                especialidad: document.getElementById('especialidad').value
            };

            try {
                const response = await fetch('http://localhost:3000/medico', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('¡Médico registrado con éxito!');
                    form.reset();
                    originalData = null; // Clear original data
                } else {
                    const error = await response.json();
                    alert(`Error al registrar: ${error.details || error.error || 'Desconocido'}`);
                }
            } catch (err) {
                console.error(err);
                alert('Ocurrió un error al intentar conectarse al servidor.');
            }
        });
    }
});
