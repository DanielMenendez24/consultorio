document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-reg-medico');
    let originalData = null;

    if (form) {
        const btnModificar = document.getElementById('btn-modificar');
        const ciInput = document.getElementById('ci');

        if (ciInput) {
            ciInput.addEventListener('input', () => {
                if (btnModificar) btnModificar.disabled = true;
            });

            ciInput.addEventListener('blur', async () => {
                const ci = ciInput.value;
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
                                document.getElementById('sexo').value = person.sexo || '';
                                document.getElementById('departamento').value = person.departamento || '';
                                document.getElementById('ciudad').value = person.ciudad || '';
                                document.getElementById('barrio').value = person.barrio || '';
                                document.getElementById('calle').value = person.calle || '';
                                document.getElementById('numeroPuerta').value = person.nroApartamento || '';
                                document.getElementById('telPersona').value = person.telefono || '';
                                if (person.especialidad) {
                                    document.getElementById('especialidad').value = person.especialidad;
                                }

                                if (btnModificar) btnModificar.disabled = false;

                                // Store original data for diffing
                                originalData = {
                                    ci: person.ci,
                                    nombre: person.nombreP || '',
                                    apellido: person.apellidoP || '',
                                    fechaNacimiento: person.fechaNac ? new Date(person.fechaNac).toISOString().split('T')[0] : '',
                                    sexo: person.sexo || '',
                                    departamento: person.departamento || '',
                                    ciudad: person.ciudad || '',
                                    barrio: person.barrio || '',
                                    calle: person.calle || '',
                                    numeroPuerta: person.nroApartamento || '',
                                    telPersona: person.telefono || '',
                                    especialidad: person.especialidad || ''
                                };
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching person data:', err);
                    }
                }
            });
        }

        if (btnModificar) {
            btnModificar.addEventListener('click', async () => {
                const ci = ciInput.value;
                const currentData = {
                    ci: ci,
                    nombre: document.getElementById('nombre').value,
                    apellido: document.getElementById('apellido').value,
                    fechaNacimiento: document.getElementById('fechaNacimiento').value,
                    sexo: document.getElementById('sexo').value,
                    departamento: document.getElementById('departamento').value,
                    ciudad: document.getElementById('ciudad').value,
                    barrio: document.getElementById('barrio').value,
                    calle: document.getElementById('calle').value,
                    numeroPuerta: document.getElementById('numeroPuerta').value,
                    telPersona: document.getElementById('telPersona').value,
                    especialidad: document.getElementById('especialidad').value
                };

                // Filter only changed fields
                const updates = {};
                for (const key in currentData) {
                    if (currentData[key] !== (originalData ? originalData[key] : '')) {
                        updates[key] = currentData[key];
                    }
                }

                if (Object.keys(updates).length === 0) {
                    alert('No se detectaron cambios para modificar.');
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:3000/medico/${originalData ? originalData.ci : ci}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updates)
                    });

                    if (response.ok) {
                        alert('¡Datos modificados con éxito!');
                        // Update originalData with new values
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

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                ci: document.getElementById('ci').value,
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                sexo: document.getElementById('sexo').value,
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
