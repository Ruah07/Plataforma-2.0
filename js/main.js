// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MENÚ MÓVIL (HAMBURGUESA)
    // ==========================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            // A. Alternamos la clase 'active' en la lista
            navList.classList.toggle('active');

            // B. Accesibilidad: Actualizamos aria-expanded
            const isOpened = menuToggle.getAttribute('aria-expanded') === "true";
            menuToggle.setAttribute('aria-expanded', !isOpened);
        });
    }

    // Cerrar el menú si se hace clic en un enlace (Mejora UX en móvil)
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navList && navList.classList.contains('active')) {
                navList.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', "false");
            }
        });
    });

    // ==========================================
    // 2. LÓGICA DE FILTRADO (CRONOGRAMA COMPLETO)
    // ==========================================
    const inputSearch = document.getElementById('inputSearch');
    const filterMonth = document.getElementById('filterMonth');
    const scheduleContainer = document.getElementById('scheduleContainer');

    // Verificamos que estemos en la página de cronograma
    if (inputSearch && scheduleContainer) {
        const courses = scheduleContainer.querySelectorAll('.schedule-card');

        // Función para normalizar texto (quitar tildes y diacríticos)
        const normalizeText = (text) => {
            return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        const filterCourses = () => {
            const searchTerm = normalizeText(inputSearch.value);
            const selectedMonth = filterMonth ? filterMonth.value : "";
            let hasVisibleCourses = false;

            courses.forEach(card => {
                // Obtenemos los datos de los atributos data- que pusimos en el HTML
                const courseName = normalizeText(card.getAttribute('data-name') || "");
                const courseMonth = card.getAttribute('data-month') || "";

                // Lógica de coincidencia cruzada (Buscador Y Mes)
                const matchesSearch = courseName.includes(searchTerm);
                const matchesMonth = selectedMonth === "" || courseMonth === selectedMonth;

                if (matchesSearch && matchesMonth) {
                    card.style.display = "flex";
                    // Pequeño timeout para que la transición de CSS (opacity/scale) funcione
                    setTimeout(() => {
                        card.style.opacity = "1";
                        card.style.transform = "scale(1)";
                    }, 10);
                    hasVisibleCourses = true;
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.95)";
                    // Ocultamos después de la animación
                    card.style.display = "none";
                }
            });

            // Manejo visual de "No resultados" con el nuevo div personalizado
            let noResults = document.getElementById('noResults');
            if (noResults) {
                if (hasVisibleCourses) {
                    noResults.style.display = 'none';
                } else {
                    noResults.style.display = 'block';
                    noResults.style.opacity = "1"; // Aseguramos visibilidad
                }
            }
        };

        // Escuchamos eventos de escritura y cambio de selección
        inputSearch.addEventListener('input', filterCourses);
        if (filterMonth) {
            filterMonth.addEventListener('change', filterCourses);
        }
    }

    // ==========================================
    // 3. EFECTO DE HEADER AL HACER SCROLL
    // ==========================================
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainHeader.style.padding = "0.5rem 0";
                mainHeader.style.background = "rgba(255, 255, 255, 0.95)"; // Glassmorphism más sólido al bajar
                mainHeader.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
            } else {
                mainHeader.style.padding = "1rem 0";
                mainHeader.style.background = "rgba(255, 255, 255, 0.8)";
                mainHeader.style.boxShadow = "none";
            }
        });
    }

});

// ==========================================
    // 3. Logica Cursos
    // ==========================================

// js/main.js -> Dentro del DOMContentLoaded

const filterPills = document.querySelectorAll('.filter-pill');
const courseCards = document.querySelectorAll('.course-card-v2');

filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
        // Switch Active Class
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const category = pill.getAttribute('data-category');

        courseCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (category === 'all' || cardCat === category) {
                card.style.display = "block";
                setTimeout(() => card.style.opacity = "1", 10);
            } else {
                card.style.opacity = "0";
                setTimeout(() => card.style.display = "none", 300);
            }
        });
    });
});


particlesJS("particles-js", {"particles":{"number":{"value":260,"density":{"enable":true,"value_area":800}},"color":{"value":"#ff5a72"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.5,"random":false,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":3,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":true,"distance":150,"color":"#6d6d6d","opacity":0.4,"width":1},"move":{"enable":true,"speed":6,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"repulse"},"onclick":{"enable":true,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});var count_particles, stats, update; stats = new Stats; stats.setMode(0); stats.domElement.style.position = 'absolute'; stats.domElement.style.left = '0px'; stats.domElement.style.top = '0px'; document.body.appendChild(stats.domElement); count_particles = document.querySelector('.js-count-particles'); update = function() { stats.begin(); stats.end(); if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) { count_particles.innerText = window.pJSDom[0].pJS.particles.array.length; } requestAnimationFrame(update); }; requestAnimationFrame(update);;