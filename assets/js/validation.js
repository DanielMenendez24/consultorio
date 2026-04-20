// ─── CI Validation (global) ─────────────────────────────────────────────────
function esCedulaValida(ci) {
    ci = ci.replace(/\D/g, '');
    if (ci.length !== 7 && ci.length !== 8) return false;
    const todosIguales = ci.split('').every(char => char === ci[0]);
    if (todosIguales) return false;
    if (ci.length === 7) ci = '0' + ci;
    const factores = [2, 9, 8, 7, 6, 3, 4];
    let suma = 0;
    for (let i = 0; i < 7; i++) suma += parseInt(ci[i]) * factores[i];
    const dvCalculado = (10 - (suma % 10)) % 10;
    return dvCalculado === parseInt(ci[7]);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'pages/consultorio.html';
                } else {
                    alert(data.error || 'Error en el inicio de sesión');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('No se pudo conectar con el servidor');
            }
        });
    }

    // Validación del input de búsqueda de pacientes (solo números)
    const searchInput = document.getElementById('search-ci');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput) {
        // Prevenir ingreso de letras y caracteres especiales en tiempo real
        searchInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }


    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            const ciValue = searchInput.value.trim();
            if (ciValue === '') {
                e.preventDefault();
                alert('Por favor, ingrese un número de documento para buscar.');
            } else if (!/^\d+$/.test(ciValue)) {
                e.preventDefault();
                alert('El documento ingresado debe contener únicamente números.');
            } else if (!esCedulaValida(ciValue)) {
                e.preventDefault();
                alert('El documento ingresado no parece correcto. Ingrese nuevamente');
            } else {
                // Simulación o ejecución de búsqueda
                // Despachamos un evento personalizado para que listar.js lo escuche
                const searchEvent = new CustomEvent('valid-search', { detail: { ci: ciValue } });
                document.dispatchEvent(searchEvent);
                
                // Limpiar el contenido del input tras buscar:
                searchInput.value = '';
            }
        });
    }

});