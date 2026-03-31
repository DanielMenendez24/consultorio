document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-reg-turno');
    const ciPacienteInput = document.getElementById('ciPaciente');
    const especialidadSelect = document.getElementById('especialidad');
    const ciMedicoSelect = document.getElementById('ciMedico');
    const nombrePacienteInput = document.getElementById('nombrePaciente');
    const btnModificar = document.getElementById('btn-modificar');
    const fechaInput = document.getElementById('fecha');

    let currentTurnoId = null;

    if (form) {
        // --- Fetch Specialties on Load ---
        const fetchSpecialties = async () => {
            try {
                const response = await fetch('http://localhost:3000/especialidad');
                if (response.ok) {
                    const specialties = await response.json();
                    especialidadSelect.innerHTML = '<option value="" disabled selected>Seleccione especialidad...</option>';
                    specialties.forEach(esp => {
                        const option = document.createElement('option');
                        option.value = esp;
                        option.textContent = esp;
                        especialidadSelect.appendChild(option);
                    });
                }
            } catch (err) {
                console.error('Error fetching specialties:', err);
            }
        };

        // --- Fetch Doctors by Specialty ---
        const fetchDoctorsBySpecialty = async (specialty, selectedCi = null) => {
            try {
                const response = await fetch(`http://localhost:3000/medico/especialidad/${encodeURIComponent(specialty)}`);
                if (response.ok) {
                    const doctors = await response.json();
                    ciMedicoSelect.innerHTML = '<option value="" disabled selected>Seleccione médico...</option>';
                    doctors.forEach(doc => {
                        const option = document.createElement('option');
                        option.value = doc.ci;
                        option.textContent = `${doc.nombre} (CI: ${doc.ci})`;
                        ciMedicoSelect.appendChild(option);
                    });
                    ciMedicoSelect.disabled = false;
                    
                    if (selectedCi) {
                        ciMedicoSelect.value = selectedCi;
                    }
                }
            } catch (err) {
                console.error('Error fetching doctors:', err);
            }
        };

        fetchSpecialties();

        especialidadSelect.addEventListener('change', () => {
            fetchDoctorsBySpecialty(especialidadSelect.value);
        });

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
                            
                            // To set the doctor correctly, we first fetch their info to get their specialty
                            const docInfoResp = await fetch(`http://localhost:3000/persona/${turno.ciMedico}`);
                            if (docInfoResp.ok) {
                                const docInfo = await docInfoResp.json();
                                if (docInfo && docInfo.length > 0) {
                                    const specialty = docInfo[0].especialidad;
                                    especialidadSelect.value = specialty;
                                    await fetchDoctorsBySpecialty(specialty, turno.ciMedico);
                                }
                            }

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

        // --- Auto-fill fetching functions (Patient only now) ---
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

        // --- Event Listeners ---
        ciPacienteInput.addEventListener('blur', () => {
            fetchPatientName(ciPacienteInput.value.trim());
            checkExistingTurno();
        });

        fechaInput.addEventListener('change', checkExistingTurno);

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
                ciMedico: ciMedicoSelect.value,
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
            
            if (!formData.ciMedico) {
                alert('Por favor, seleccione un médico.');
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
                    ciMedicoSelect.innerHTML = '<option value="" disabled selected>Seleccione especialidad primero...</option>';
                    ciMedicoSelect.disabled = true;
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
                ciMedicoSelect.innerHTML = '<option value="" disabled selected>Seleccione especialidad primero...</option>';
                ciMedicoSelect.disabled = true;
                currentTurnoId = null;
                if (btnModificar) btnModificar.disabled = true;
            });
        }
    }
});
