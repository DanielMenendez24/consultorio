document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');

    if (menuToggle && navUl) {
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Handle menu links and dropdowns
        const navLinks = document.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const nextEl = link.nextElementSibling;
                // If it's a dropdown link, toggle the active class
                if (nextEl && nextEl.classList.contains('dropdown-menu')) {
                    e.preventDefault();
                    link.parentElement.classList.toggle('active');
                } else {
                    // Close the entire menu if non-dropdown link is clicked
                    navUl.classList.remove('active');
                    menuToggle.classList.remove('active');
                    // Also close any open dropdowns
                    document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown') && !e.target.closest('.menu-toggle')) {
                document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
            }
        });
    }
});
