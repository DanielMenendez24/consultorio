document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-reg-turno');
    const ciPacienteInput = document.getElementById('ciPaciente');
    const especialidadSelect = document.getElementById('especialidad');
    const ciMedicoSelect = document.getElementById('ciMedico');
    const nombrePacienteInput = document.getElementById('nombrePaciente');
    const btnModificar = document.getElementById('btn-modificar');
    const btnEliminar = document.getElementById('btn-eliminar');
    const fechaInput = document.getElementById('fecha');

    let currentTurnoId = null;

    if (form) {
        // Set minimum date to today
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').setAttribute('min', todayStr);

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
                            if (btnEliminar) btnEliminar.style.display = 'block';
                        } else {
                            currentTurnoId = null;
                            if (btnModificar) btnModificar.disabled = true;
                            if (btnEliminar) btnEliminar.style.display = 'none';
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
                            if (person.tipoSangre && person.estado === 'Alta') {
                                nombrePacienteInput.value = `${person.apellidoP}, ${person.nombreP}`;
                                nombrePacienteInput.style.color = '#10b981';
                            } else if (person.tipoSangre && person.estado !== 'Alta') {
                                nombrePacienteInput.value = 'Paciente está de BAJA';
                                nombrePacienteInput.style.color = '#ef4444';
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

        // --- Date / Time validation helpers ---
        const fechaContainer = document.getElementById('fecha-container');
        const fechaError = document.getElementById('fecha-error');
        const horaInput = document.getElementById('hora');
        const horaContainer = document.getElementById('hora-container');
        const horaError = document.getElementById('hora-error');

        const showError = (container, span) => {
            if (container) container.classList.add('has-error');
            if (span) span.style.display = 'block';
        };
        const clearError = (container, span) => {
            if (container) container.classList.remove('has-error');
            if (span) span.style.display = 'none';
        };

        const isFechaValid = (val) => {
            if (!val) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(val + 'T00:00:00') >= today;
        };

        const isHoraValid = (val) => {
            if (!val) return false;
            const [h, m] = val.split(':').map(Number);
            const minutes = h * 60 + m;
            return minutes >= 7 * 60 && minutes <= 20 * 60;
        };

        fechaInput.addEventListener('change', () => {
            if (!isFechaValid(fechaInput.value)) {
                showError(fechaContainer, fechaError);
            } else {
                clearError(fechaContainer, fechaError);
            }
        });

        horaInput.addEventListener('change', () => {
            if (!isHoraValid(horaInput.value)) {
                showError(horaContainer, horaError);
            } else {
                clearError(horaContainer, horaError);
            }
        });

        // --- Form Submission (Register) ---
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate date
            if (!isFechaValid(fechaInput.value)) {
                showError(fechaContainer, fechaError);
                fechaInput.focus();
                return;
            }
            clearError(fechaContainer, fechaError);

            // Validate time
            if (!isHoraValid(horaInput.value)) {
                showError(horaContainer, horaError);
                horaInput.focus();
                return;
            }
            clearError(horaContainer, horaError);

            const formData = {
                ciPaciente: ciPacienteInput.value,
                ciMedico: ciMedicoSelect.value,
                fecha: fechaInput.value,
                hora: horaInput.value,
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
                    if (btnModificar) btnModificar.disabled = true;
                    if (btnEliminar) btnEliminar.style.display = 'none';
                    document.getElementById('estado').value = 'Pendiente';
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

        // --- Delete / Cancel logic ---
        if (btnEliminar) {
            btnEliminar.addEventListener('click', async () => {
                if (!currentTurnoId) return;

                if (!confirm('¿Estás seguro de que deseas cancelar este turno? El estado cambiará a "Cancelada".')) return;

                try {
                    const response = await fetch(`http://localhost:3000/turno/${currentTurnoId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        // Update state field visually — don't reset the form
                        const estadoInput = document.getElementById('estado');
                        estadoInput.value = 'Cancelada';
                        estadoInput.style.color = '#991b1b';

                        // Disable action buttons — turno is now cancelled
                        if (btnModificar) btnModificar.disabled = true;
                        btnEliminar.disabled = true;
                        btnEliminar.textContent = 'Turno Cancelado';
                        btnEliminar.style.opacity = '0.6';

                        alert('¡Turno cancelado con éxito! El estado fue actualizado a "Cancelada".');
                    } else {
                        const error = await response.json();
                        alert(`Error al cancelar: ${error.error || 'Desconocido'}`);
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
                if (btnEliminar) btnEliminar.style.display = 'none';
                document.getElementById('estado').value = 'Pendiente';
            });
        }
    }
});
