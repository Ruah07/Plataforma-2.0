// /js/main.js

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  // ==========================================
  // 1) MENÚ MÓVIL (HAMBURGUESA) + ACCESIBILIDAD
  // ==========================================
  const menuToggle = $(".menu-toggle");
  const navList = $(".nav-list");

  if (menuToggle && navList) {
    if (!navList.id) navList.id = "primary-nav";
    menuToggle.setAttribute("aria-controls", navList.id);

    const openMenu = () => {
      navList.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
    };

    const closeMenu = () => {
      navList.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = navList.classList.contains("active");
      isOpen ? closeMenu() : openMenu();
    });

    $$(".nav-list a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // ==========================================
  // 2) FILTRADO (CRONOGRAMA)
  // ==========================================
  const inputSearch = $("#inputSearch");
  const filterMonth = $("#filterMonth");
  const scheduleContainer = $("#scheduleContainer");

  if (inputSearch && scheduleContainer) {
    const cards = $$(".schedule-card", scheduleContainer);

    const normalizeText = (text) =>
      String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const filterCourses = () => {
      const searchTerm = normalizeText(inputSearch.value);
      const selectedMonth = filterMonth ? filterMonth.value : "";
      let hasVisible = false;

      cards.forEach((card) => {
        const courseName = normalizeText(card.getAttribute("data-name") || "");
        const courseMonth = card.getAttribute("data-month") || "";

        const matchesSearch = courseName.includes(searchTerm);
        const matchesMonth = selectedMonth === "" || courseMonth === selectedMonth;

        if (matchesSearch && matchesMonth) {
          card.style.display = "flex";
          requestAnimationFrame(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
          });
          hasVisible = true;
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.95)";
          setTimeout(() => {
            card.style.display = "none";
          }, 200);
        }
      });

      const noResults = $("#noResults");
      if (noResults) noResults.style.display = hasVisible ? "none" : "block";
    };

    inputSearch.addEventListener("input", filterCourses);
    if (filterMonth) filterMonth.addEventListener("change", filterCourses);
  }

  // ==========================================
  // 3) EFECTO HEADER AL SCROLL
  // ==========================================
  const mainHeader = $(".main-header");
  if (mainHeader) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        mainHeader.style.padding = "0.5rem 0";
        mainHeader.style.background = "rgba(255, 255, 255, 0.95)";
        mainHeader.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
      } else {
        mainHeader.style.padding = "1rem 0";
        mainHeader.style.background = "rgba(255, 255, 255, 0.8)";
        mainHeader.style.boxShadow = "none";
      }
    });
  }

  // ==========================================
  // 4) LÓGICA CURSOS (PILLS)
  // ==========================================
  const filterPills = $$(".filter-pill");
  const courseCards = $$(".course-card-v2");

  if (filterPills.length && courseCards.length) {
    filterPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        filterPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        const category = pill.getAttribute("data-category");

        courseCards.forEach((card) => {
          const cardCat = card.getAttribute("data-category");
          const shouldShow = category === "all" || cardCat === category;

          if (shouldShow) {
            card.style.display = "block";
            requestAnimationFrame(() => (card.style.opacity = "1"));
          } else {
            card.style.opacity = "0";
            setTimeout(() => (card.style.display = "none"), 250);
          }
        });
      });
    });
  }

  // ==========================================
  // 5) PARTICLES (solo si existe contenedor + librería)
  // ==========================================
  const particlesRoot = $("#particles-js");

  if (particlesRoot && window.particlesJS) {
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 260, density: { enable: true, value_area: 800 } },
        color: { value: "#ff5a72" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#6d6d6d",
          opacity: 0.4,
          width: 1
        },
        move: { enable: true, speed: 6, direction: "none", out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: { repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 } }
      },
      retina_detect: true
    });
  }

  // ==========================================
  // 6) MODAL (DETALLE DE CURSO) - CRONOGRAMA
  // ==========================================
  const modal = $("#courseModal");
  const coursesDataEl = $("#coursesData");

  if (modal && coursesDataEl) {
    let courseMap = {};
    try {
      const data = JSON.parse(coursesDataEl.textContent || "[]");
      courseMap = data.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    } catch (e) {
      console.warn("coursesData inválido:", e);
    }

    const overlay = $(".modal__overlay", modal);
    const dialog = $(".modal__dialog", modal);
    const closeEls = $$("[data-close='true']", modal);

    const elTag = $("#courseModalTag");
    const elTitle = $("#courseModalTitle");
    const elDesc = $("#courseModalDesc");
    const elDate = $("#courseModalDate");
    const elDuration = $("#courseModalDuration");
    const elModality = $("#courseModalModality");
    const elInstructor = $("#courseModalInstructor");
    const elAudience = $("#courseModalAudience");

    // botones del modal (nuevos ids)
    const infoBtn = $("#courseModalInfo");
    const campusBtn = $("#courseModalCampus");

    let lastFocus = null;

    const getFocusable = () =>
      $$(
        "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
        modal
      ).filter((el) => !el.hasAttribute("disabled"));

    const openModal = (courseId) => {
      const course = courseMap[courseId];
      if (!course) return;

      lastFocus = document.activeElement;

      elTag.textContent = course.category || "Curso";
      elTitle.textContent = course.title || "Curso";
      elDesc.textContent = course.description || "Sin descripción disponible.";
      elDate.textContent = course.startDate
        ? `${course.startDate} (${course.monthName || course.month})`
        : "Fecha por confirmar";
      elDuration.textContent = course.duration || "Duración por confirmar";
      elModality.textContent = course.modality || "Modalidad por confirmar";
      elInstructor.textContent = course.instructor || "Instructor por confirmar";
      elAudience.textContent = course.audience || "Información por confirmar.";

      // ✅ Campus
      if (campusBtn) {
        campusBtn.href = "https://capacita.cidet.org.co/";
        campusBtn.target = "_blank";
        campusBtn.rel = "noopener noreferrer";
        campusBtn.setAttribute(
          "aria-label",
          `Inscribirme en el campus para ${course.title} (se abre en una nueva pestaña)`
        );
      }

      // ✅ WhatsApp con mensaje prellenado
      const WHATSAPP_NUMBER = "573216365761";

      const message = `Hola CIDET Capacita, quiero más información sobre el curso: "${course.title}".
        Fecha: ${course.startDate || "Por confirmar"}.
        Duración: ${course.duration || "Por confirmar"}.
        Modalidad: ${course.modality || "Por confirmar"}.
        ¿Me pueden ayudar con precios, horarios y proceso de inscripción?`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      if (infoBtn) {
        infoBtn.href = waUrl;
        infoBtn.target = "_blank";
        infoBtn.rel = "noopener noreferrer";
        infoBtn.setAttribute(
          "aria-label",
          `Solicitar información por WhatsApp sobre ${course.title} (se abre en una nueva pestaña)`
        );
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const focusables = getFocusable();
      (focusables[0] || dialog).focus?.();
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    $$(".js-open-course").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-open-course");
        openModal(id);
      });
    });

    closeEls.forEach((el) => el.addEventListener("click", closeModal));
    if (overlay) overlay.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }

      if (e.key === "Tab") {
        const focusables = getFocusable();
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
});
