class AppHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const isInternal = this.getAttribute('internal') !== null;
        const rootPath = isInternal ? '../' : './';
        const pagesPath = isInternal ? '' : 'pages/';

        this.innerHTML = `
        <header>
            <nav>
                <div class="logo-small">
                    <span class="logo-icon">
                        <img src="${rootPath}assets/img/lasegundaopcion_logo.png" alt="Logo La Segunda Opción">
                    </span>
                    <span>La Segunda Opción</span>
                </div>
                <button class="menu-toggle" aria-label="Abrir menú">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>
                <ul>
                    <li><a href="${pagesPath}consultorio.html" id="nav-inicio">Inicio</a></li>
                    <li class="dropdown">
                        <a href="#" id="nav-listar">Listar</a>
                        <ul class="dropdown-menu">
                            <li><a href="${pagesPath}list_pacientes.html">Pacientes</a></li>
                            <li><a href="${pagesPath}list_medicos.html">Médicos</a></li>
                            <li><a href="${pagesPath}list_turnos.html">Turnos</a></li>
                        </ul>
                    </li>
                    <li class="dropdown">
                        <a href="#" id="nav-gestionar">Gestionar</a>
                        <ul class="dropdown-menu">
                            <li><a href="${pagesPath}reg_pacientes.html">Pacientes</a></li>
                            <li><a href="${pagesPath}reg_medicos.html">Médicos</a></li>
                            <li><a href="${pagesPath}reg_turnos.html">Turnos</a></li>
                        </ul>
                    </li>
                    <li>
                        <button id="theme-toggle" class="btn-theme" title="Cambiar tema">
                            <span class="theme-icon">🌞</span>
                        </button>
                    </li>
                    <li><a href="#" id="btn-logout" class="logout-link">Cerrar Sesión</a></li>
                </ul>
            </nav>
        </header>
        `;

        this.initTheme();
        this.initDropdowns();
        this.initLogout();
        this.highlightActive();
    }

    initTheme() {
        const toggle = this.querySelector('#theme-toggle');
        const icon = toggle.querySelector('.theme-icon');
        const currentTheme = localStorage.getItem('theme') || 'light';

        document.documentElement.setAttribute('data-theme', currentTheme);
        icon.textContent = currentTheme === 'dark' ? '🌙' : '🌞';

        toggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            icon.textContent = newTheme === 'dark' ? '🌙' : '🌞';
        });
    }

    initDropdowns() {
        const menuToggle = this.querySelector('.menu-toggle');
        const navUl = this.querySelector('nav ul');

        if (menuToggle && navUl) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navUl.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });

            // Dropdowns logic for both mobile and desktop (click-based)
            const dropdowns = this.querySelectorAll('.dropdown > a');
            dropdowns.forEach(d => {
                d.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const parent = d.parentElement;
                    const isActive = parent.classList.contains('active');
                    
                    // Close other open dropdowns
                    this.querySelectorAll('.dropdown.active').forEach(openDropdown => {
                        if (openDropdown !== parent) openDropdown.classList.remove('active');
                    });

                    // Toggle current dropdown
                    parent.classList.toggle('active');
                    console.log(`[Nav] Dropdown toggled: ${isActive ? 'closed' : 'opened'}`);
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', () => {
                this.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
            });
        }
    }

    initLogout() {
        const logoutBtn = this.querySelector('#btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                const isInternal = this.getAttribute('internal') !== null;
                const rootPath = isInternal ? '../' : './';
                window.location.href = rootPath + 'index.html';
            });
        }
    }

    highlightActive() {
        const path = window.location.pathname;
        const links = this.querySelectorAll('nav a');
        links.forEach(link => {
            if (link.getAttribute('href') && path.includes(link.getAttribute('href').replace('../', '').replace('./', ''))) {
                link.classList.add('active');
                // Highlight parent dropdown if nested
                const dropdown = link.closest('.dropdown');
                if (dropdown) dropdown.querySelector('a').classList.add('active');
            }
        });
    }
}

customElements.define('app-header', AppHeader);
