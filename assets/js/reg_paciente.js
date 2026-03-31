document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-reg-paciente');
    
    if (form) {
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
                tipoSangre: document.getElementById('tipoSangre').value
            };

            try {
                const response = await fetch('http://localhost:3000/paciente', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('¡Paciente registrado con éxito!');
                    form.reset(); // Limpia los campos del formulario
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
