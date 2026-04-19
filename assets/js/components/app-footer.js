class AppFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
        <footer>
            <div class="footer-content">
                <p>La Segunda Opción | El lugar donde Google viene a confirmar sus dudas.</p>
                <p>Todos los derechos reservados &copy; ${year}</p>
            </div>
        </footer>
        <style>
            footer {
                padding: 4rem 2rem;
                text-align: center;
                border-top: 1px solid var(--border-color);
                margin-top: 4rem;
                background: var(--bg-color);
                transition: var(--transition);
            }
            footer p {
                font-size: 0.9rem;
                color: var(--text-muted);
                margin-bottom: 0.5rem;
            }
        </style>
        `;
    }
}

customElements.define('app-footer', AppFooter);
