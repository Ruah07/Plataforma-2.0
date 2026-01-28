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
  // - Búsqueda por texto
  // - Mes (almanaque type="month") ✅
  // - Intensidad horaria (rangos) ✅
  // ==========================================
  const inputSearch = $("#inputSearch");
  const filterMonthPicker = $("#filterMonthPicker"); // input type="month"
  const filterHours = $("#filterHours"); // select intensidad
  const scheduleContainer = $("#scheduleContainer");
  const coursesDataEl = $("#coursesData");

  if (inputSearch && scheduleContainer) {
    const cards = $$(".schedule-card", scheduleContainer);

    // ✅ Mapa id -> curso (para sacar duración desde JSON)
    let courseMap = {};
    if (coursesDataEl) {
      try {
        const data = JSON.parse(coursesDataEl.textContent || "[]");
        courseMap = data.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});
      } catch (e) {
        console.warn("coursesData inválido (para filtros):", e);
      }
    }

    const normalizeText = (text) =>
      String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    // "24 horas" -> 24
    const parseHours = (value) => {
      const n = parseInt(String(value || "").match(/\d+/)?.[0] || "0", 10);
      return Number.isFinite(n) ? n : 0;
    };

    // data-month (Ene/Feb/...) -> "01/02/..."
    const monthMap = {
      Ene: "01",
      Feb: "02",
      Mar: "03",
      Abr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Ago: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dic: "12"
    };

    const filterCourses = () => {
      const searchTerm = normalizeText(inputSearch.value);

      // ✅ Mes (YYYY-MM) del almanaque
      const pickedMonth = filterMonthPicker ? filterMonthPicker.value : "";

      // ✅ Intensidad "min-max"
      const hoursRange = filterHours ? filterHours.value : "";
      const [minH, maxH] = hoursRange
        ? hoursRange.split("-").map((x) => parseInt(x, 10))
        : [null, null];

      let hasVisible = false;

      cards.forEach((card) => {
        // --- texto ---
        const titleText = card.querySelector("h4")?.textContent || "";
        const courseName = normalizeText(card.getAttribute("data-name") || titleText);

        // --- mes abreviado ---
        const courseMonth = card.getAttribute("data-month") || "";

        // --- id para cruzar con JSON ---
        const courseId =
          card.querySelector("[data-open-course]")?.getAttribute("data-open-course") ||
          card.getAttribute("data-course-id") ||
          "";

        const courseFromJson = courseId ? courseMap[courseId] : null;

        // --- horas desde JSON o fallback desde card ---
        const hoursFromJson = courseFromJson ? parseHours(courseFromJson.duration) : 0;

        const cardMetaText =
          card.querySelector(".meta-grid")?.textContent ||
          card.querySelector(".meta-info")?.textContent ||
          "";

        const hoursFromCard = parseHours(cardMetaText);
        const courseHours = hoursFromJson || hoursFromCard || 0;

        // ✅ matches
        const matchesSearch = courseName.includes(searchTerm);

        // ✅ mes (almanaque)
        let matchesMonthPicker = true;
        if (pickedMonth) {
          const mm = monthMap[courseMonth] || "";
          const cardMonthKey = mm ? `2026-${mm}` : "";
          matchesMonthPicker = cardMonthKey === pickedMonth;
        }

        // ✅ intensidad
        let matchesHours = true;
        if (hoursRange) {
          matchesHours = courseHours >= minH && courseHours <= maxH;
        }

        const shouldShow = matchesSearch && matchesMonthPicker && matchesHours;

        if (shouldShow) {
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
    if (filterMonthPicker) filterMonthPicker.addEventListener("change", filterCourses);
    if (filterHours) filterHours.addEventListener("change", filterCourses);

    // ✅ filtra al cargar
    filterCourses();
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
  const WHATSAPP_NUMBER = "573216365761";

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
    const elSchedule = $("#courseModalSchedule");
    const elInstructor = $("#courseModalInstructor");
    const elAudience = $("#courseModalAudience");

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

      if (elTag) elTag.textContent = course.category || "Curso";
      if (elTitle) elTitle.textContent = course.title || "Curso";
      if (elDesc) elDesc.textContent = course.description || "Sin descripción disponible.";

      if (elDate) {
        elDate.textContent = course.startDate
          ? `${course.startDate} (${course.monthName || course.month})`
          : "Fecha por confirmar";
      }

      if (elSchedule) elSchedule.textContent = course.schedule || "Horario por confirmar";
      if (elDuration) elDuration.textContent = course.duration || "Duración por confirmar";
      if (elModality) elModality.textContent = course.modality || "Modalidad por confirmar";
      if (elInstructor) elInstructor.textContent = course.instructor || "Instructor por confirmar";
      if (elAudience) elAudience.textContent = course.audience || "Información por confirmar.";

      // Campus
      if (campusBtn) {
        campusBtn.href = "https://capacita.cidet.org.co/";
        campusBtn.target = "_blank";
        campusBtn.rel = "noopener noreferrer";
        campusBtn.setAttribute(
          "aria-label",
          `Inscribirme en el campus para ${course.title || "este curso"} (se abre en una nueva pestaña)`
        );
      }

      // WhatsApp
      const message = `Hola CIDET Capacita, quiero más información sobre el curso: "${course.title || "Curso"}".
Fecha: ${course.startDate || "Por confirmar"}.
Horario: ${course.schedule || "Por confirmar"}.
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
          `Solicitar información por WhatsApp sobre ${course.title || "este curso"} (se abre en una nueva pestaña)`
        );
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const focusables = getFocusable();
      (focusables[0] || dialog)?.focus?.();
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

  // ==========================================
  // 7) MODAL MEMBRESÍAS (HOME) ✅ NUEVO
  // ==========================================
  const membershipsModal = $("#membershipsModal");
  const openMembershipBtns = $$(".js-open-memberships");

  if (membershipsModal && openMembershipBtns.length) {
    const overlay = $(".modal__overlay", membershipsModal);
    const dialog = $(".modal__dialog", membershipsModal);
    const closeEls = $$("[data-close='true']", membershipsModal);

    const waBtn = $("#membershipsInfo"); // botón “Solicitar información” del modal
    let lastFocus = null;

    const getFocusable = () =>
      $$(
        "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
        membershipsModal
      ).filter((el) => !el.hasAttribute("disabled"));

    const open = () => {
      lastFocus = document.activeElement;

      // WhatsApp prellenado (general)
      const message = `Hola CIDET Capacita, quiero información sobre las Membresías (6 y 12 meses).
¿Me pueden compartir beneficios, precios y proceso de inscripción?`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      if (waBtn) {
        waBtn.href = waUrl;
        waBtn.target = "_blank";
        waBtn.rel = "noopener noreferrer";
        waBtn.setAttribute(
          "aria-label",
          "Solicitar información por WhatsApp sobre Membresías (se abre en una nueva pestaña)"
        );
      }

      membershipsModal.classList.add("is-open");
      membershipsModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const focusables = getFocusable();
      (focusables[0] || dialog)?.focus?.();
    };

    const close = () => {
      membershipsModal.classList.remove("is-open");
      membershipsModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    openMembershipBtns.forEach((btn) => btn.addEventListener("click", open));
    closeEls.forEach((el) => el.addEventListener("click", close));
    if (overlay) overlay.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (!membershipsModal.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
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

  // ==========================================
  // 8) MODAL PROMO (CRONOGRAMA) ✅ AUTO-OPEN EN CADA CARGA
  // ==========================================
  const promoModal = $("#promoModal");

  if (promoModal) {
    const overlay = $(".modal__overlay", promoModal);
    const dialog = $(".modal__dialog", promoModal);
    const closeEls = $$("[data-close='true']", promoModal);

    let lastFocus = null;

    const getFocusable = () =>
      $$(
        "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
        promoModal
      ).filter((el) => !el.hasAttribute("disabled"));

    const openPromo = () => {
      // Evita abrir si ya hay otro modal abierto
      const anyOpen = $$(".modal.is-open").some((m) => m !== promoModal);
      if (anyOpen) return;

      lastFocus = document.activeElement;

      promoModal.classList.add("is-open");
      promoModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      const focusables = getFocusable();
      (focusables[0] || dialog)?.focus?.();
    };

    const closePromo = () => {
      promoModal.classList.remove("is-open");
      promoModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    closeEls.forEach((el) => el.addEventListener("click", closePromo));
    if (overlay) overlay.addEventListener("click", closePromo);

    document.addEventListener("keydown", (e) => {
      if (!promoModal.classList.contains("is-open")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closePromo();
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

    // ✅ AUTO-OPEN: se abre SIEMPRE en cada carga/recarga
    // (un pequeño delay para que el DOM/render estén listos)
    setTimeout(() => {
      openPromo();
    }, 250);
  }
});
