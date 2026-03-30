document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'admin' && password === 'admin') {
                window.location.href = 'consultorio.html';
            } else {
                alert('Usuario o contraseña incorrectos');
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

    // Función para validar la Cédula de Identidad Uruguaya usando dígito verificador
    function esCedulaValida(ci) {
        // Remover cualquier caracter que no sea número
        ci = ci.replace(/\D/g, '');
        
        // La CI uruguaya debe tener 7 u 8 dígitos
        if (ci.length !== 7 && ci.length !== 8) return false;
        
        // Verifica que no sean todos los números iguales (ej: 11111111)
        const todosIguales = ci.split('').every(char => char === ci[0]);
        if (todosIguales) return false;

        // Si tiene 7 dígitos, rellenar con un 0 a la izquierda
        if (ci.length === 7) {
            ci = '0' + ci;
        }

        const factores = [2, 9, 8, 7, 6, 3, 4];
        let suma = 0;

        // Sumar cada dígito multiplicado por su factor
        for (let i = 0; i < 7; i++) {
            suma += parseInt(ci[i]) * factores[i];
        }

        // Calcular dígito verificador
        const digitoVerificadorCalculado = (10 - (suma % 10)) % 10;
        const digitoVerificadorReal = parseInt(ci[7]);

        return digitoVerificadorCalculado === digitoVerificadorReal;
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
                // Simulación o ejecución de búsqueda (acá iría la lógica)
                // Limpiar el contenido del input tras buscar:
                searchInput.value = '';
            }
        });
    }

});