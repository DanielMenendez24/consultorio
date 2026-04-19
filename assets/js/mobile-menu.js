document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');

    if (menuToggle && navUl) {
        const closeMenu = () => {
            navUl.classList.remove('active');
            menuToggle.classList.remove('active');
            document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
        };

        const toggleMenu = () => {
            navUl.classList.toggle('active');
            menuToggle.classList.toggle('active');
        };

        // main toggle button
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Handle menu links and dropdowns
        const navLinks = document.querySelectorAll('nav ul li > a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const nextEl = link.nextElementSibling;
                
                // Check if it's a dropdown toggle (has a dropdown-menu child)
                if (nextEl && nextEl.classList.contains('dropdown-menu')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const parent = link.parentElement;
                    const isActive = parent.classList.contains('active');

                    // Close other active dropdowns
                    document.querySelectorAll('.dropdown.active').forEach(d => {
                        if (d !== parent) d.classList.remove('active');
                    });
                    
                    parent.classList.toggle('active', !isActive);
                } else {
                    // It's a direct link: navigate and close menu
                    closeMenu();
                }
            });
        });

        // Close menu/dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const isClickInsideMenu = navUl.contains(e.target);
            const isClickOnToggle = menuToggle.contains(e.target);

            if (!isClickInsideMenu && !isClickOnToggle) {
                closeMenu();
            }
        });

        // Accessibility: Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });
    }
});
