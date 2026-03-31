document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-reg-turno');
    const ciPacienteInput = document.getElementById('ciPaciente');
    const ciMedicoInput = document.getElementById('ciMedico');
    const nombrePacienteInput = document.getElementById('nombrePaciente');
    const nombreMedicoInput = document.getElementById('nombreMedico');
    const btnModificar = document.getElementById('btn-modificar');
    const fechaInput = document.getElementById('fecha');

    let currentTurnoId = null;

    if (form) {
        // --- Logic to check existing appointment for search/update ---
        const checkExistingTurno = async () => {
            const ciPaciente = ciPacienteInput.value.trim();
            const fecha = fechaInput.value;
            if (ciPaciente.length >= 7 && fecha) {
                try {
                    const response = await fetch(`http://localhost:3000/turno/search/${ciPaciente}/${fecha}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const turno = data[0];
                            currentTurnoId = turno.idConsulta;
                            ciMedicoInput.value = turno.ciMedico;
                            
                            // Trigger auto-fill for doctor name
                            fetchDoctorName(turno.ciMedico);

                            document.getElementById('hora').value = turno.horaConsulta;
                            document.getElementById('motivo').value = turno.motivoConsulta;
                            document.getElementById('estado').value = turno.estado;
                            document.getElementById('observaciones').value = turno.observaciones || '';
                            
                            if (btnModificar) btnModificar.disabled = false;
                        } else {
                            currentTurnoId = null;
                            if (btnModificar) btnModificar.disabled = true;
                        }
                    }
                } catch (err) {
                    console.error('Error searching turno:', err);
                }
            }
        };

        // --- Auto-fill fetching functions ---
        const fetchPatientName = async (ci) => {
            if (ci.length >= 7) {
                try {
                    const response = await fetch(`http://localhost:3000/persona/${ci}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const person = data[0];
                            if (person.tipoSangre) {
                                nombrePacienteInput.value = `${person.apellidoP}, ${person.nombreP}`;
                                nombrePacienteInput.style.color = '#10b981';
                            } else {
                                nombrePacienteInput.value = 'Persona existe pero NO es PACIENTE';
                                nombrePacienteInput.style.color = '#ef4444';
                            }
                        } else {
                            nombrePacienteInput.value = 'Paciente no encontrado';
                            nombrePacienteInput.style.color = '#ef4444';
                        }
                    }
                } catch (err) { console.error(err); }
            }
        };

        const fetchDoctorName = async (ci) => {
            if (ci.length >= 7) {
                try {
                    const response = await fetch(`http://localhost:3000/persona/${ci}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const person = data[0];
                            if (person.especialidad) {
                                nombreMedicoInput.value = `${person.apellidoP}, ${person.nombreP} (${person.especialidad})`;
                                nombreMedicoInput.style.color = '#10b981';
                            } else {
                                nombreMedicoInput.value = 'Persona existe pero NO es MÉDICO';
                                nombreMedicoInput.style.color = '#ef4444';
                            }
                        } else {
                            nombreMedicoInput.value = 'Médico no encontrado';
                            nombreMedicoInput.style.color = '#ef4444';
                        }
                    }
                } catch (err) { console.error(err); }
            }
        };

        // --- Event Listeners for Auto-fill ---
        ciPacienteInput.addEventListener('blur', () => {
            fetchPatientName(ciPacienteInput.value.trim());
            checkExistingTurno();
        });

        fechaInput.addEventListener('change', checkExistingTurno);

        ciMedicoInput.addEventListener('blur', () => {
            fetchDoctorName(ciMedicoInput.value.trim());
        });

        // Disable modify button if CI or Date changes
        [ciPacienteInput, fechaInput].forEach(el => {
            el.addEventListener('input', () => {
                if (btnModificar) btnModificar.disabled = true;
            });
        });

        // --- Form Submission (Register) ---
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                ciPaciente: ciPacienteInput.value,
                ciMedico: ciMedicoInput.value,
                fecha: document.getElementById('fecha').value,
                hora: document.getElementById('hora').value,
                motivo: document.getElementById('motivo').value,
                estado: document.getElementById('estado').value,
                observaciones: document.getElementById('observaciones').value
            };

            if (nombrePacienteInput.value.includes('no encontrado') || nombrePacienteInput.value.includes('NO es PACIENTE')) {
                alert('Por favor, ingrese un paciente válido.');
                return;
            }
            if (nombreMedicoInput.value.includes('no encontrado') || nombreMedicoInput.value.includes('NO es MÉDICO')) {
                alert('Por favor, ingrese un médico válido.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/turno', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert('¡Turno registrado con éxito!');
                    form.reset();
                    nombrePacienteInput.value = '';
                    nombreMedicoInput.value = '';
                    currentTurnoId = null;
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.error || 'Desconocido'}`);
                }
            } catch (err) {
                alert('Error al conectar con el servidor.');
            }
        });

        // --- Update logic (Modify) ---
        if (btnModificar) {
            btnModificar.addEventListener('click', async () => {
                if (!currentTurnoId) return;

                const updateData = {
                    fecha: document.getElementById('fecha').value,
                    hora: document.getElementById('hora').value,
                    motivo: document.getElementById('motivo').value,
                    estado: document.getElementById('estado').value,
                    observaciones: document.getElementById('observaciones').value
                };

                try {
                    const response = await fetch(`http://localhost:3000/turno/${currentTurnoId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (response.ok) {
                        alert('¡Turno actualizado con éxito!');
                    } else {
                        const error = await response.json();
                        alert(`Error al actualizar: ${error.error || 'Desconocido'}`);
                    }
                } catch (err) {
                    alert('Error al conectar con el servidor.');
                }
            });
        }

        // --- Clear logic ---
        const btnClear = document.querySelector('.btn-clear-form');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                nombrePacienteInput.value = '';
                nombreMedicoInput = '';
                currentTurnoId = null;
                if (btnModificar) btnModificar.disabled = true;
            });
        }
    }
});
