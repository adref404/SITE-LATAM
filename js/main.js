// ==========================================================================
// HEADER: transparente sobre el hero, sólido al hacer scroll
// ==========================================================================
function updateHeaderOnScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', updateHeaderOnScroll);

// ==========================================================================
// HEADER: MEGA-MENÚ (persistente, no se reinicia entre vistas)
// ==========================================================================
function showMenu(id) {
    document.getElementById(id).classList.add('open');
    document.getElementById(id).parentElement.classList.add('active');
}

function hideMenu(id) {
    document.getElementById(id).classList.remove('open');
    document.getElementById(id).parentElement.classList.remove('active');
}

// ==========================================================================
// HEADER: MENÚ MÓVIL (hamburguesa + sidebar deslizable)
// ==========================================================================
function toggleMobileMenu() {
    document.getElementById('mobile-nav-overlay').classList.add('active');
}

function closeMobileMenu() {
    document.getElementById('mobile-nav-overlay').classList.remove('active');
    document.querySelectorAll('.mobile-nav-group.open').forEach(group => group.classList.remove('open'));
}

function toggleMobileSubmenu(button) {
    const group = button.parentElement;
    const wasOpen = group.classList.contains('open');

    document.querySelectorAll('.mobile-nav-group.open').forEach(g => g.classList.remove('open'));

    if (!wasOpen) {
        group.classList.add('open');
    }
}

// ==========================================================================
// DISPATCHER: se ejecuta cada vez que router.js inyecta una vista nueva
// ==========================================================================
function initViewScripts(routeKey) {
    switch (routeKey) {
        case 'inicio':
            initHomeView();
            break;
        case 'gestion-operativa':
            ensureCardCarousel('gestion-operativa');
            break;
        case 'mis-datos':
            ensureCardCarousel('mis-datos');
            break;
        case 'mi-rol':
            ensureCardCarousel('mi-rol');
            break;
        case 'domicilio':
        case 'vales':
            initAccordionView();
            break;
        case 'visa':
            initAccordionView();
            initVisaFormLogic();
            break;
        default:
            break;
    }
}

// Se llama antes de reemplazar el contenido de #app para liberar timers/listeners de la vista anterior
function cleanupView() {
    stopAutoplay();
    Object.keys(cardCarousels).forEach(key => delete cardCarousels[key]);
}

// ==========================================================================
// VISTA: INICIO (carrusel + FAQ)
// ==========================================================================
let slides = [];
let dots = [];
let currentSlideIndex = 0;
let carouselInterval = null;

function initHomeView() {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const answer = button.nextElementSibling;

            faqItem.classList.toggle('active');

            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });

    initCarousel();
}

function initCarousel() {
    slides = document.querySelectorAll('.carousel-slide');
    dots = document.querySelectorAll('.dot');
    currentSlideIndex = 0;
    startAutoplay();
}

function updateCarouselDisplay(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlideIndex = index;
}

function nextSlide() {
    const targetIndex = (currentSlideIndex + 1) % slides.length;
    updateCarouselDisplay(targetIndex);
}

function goToSlide(index) {
    updateCarouselDisplay(index);
    stopAutoplay();
    startAutoplay();
}

function startAutoplay() {
    if (slides.length === 0) return;
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopAutoplay() {
    clearInterval(carouselInterval);
}

function openBannerModal(index) {
    const overlay = document.getElementById('banner-modal-overlay');
    if (!overlay) return;

    document.querySelectorAll('.banner-modal-content').forEach(content => {
        content.classList.toggle('active', content.getAttribute('data-modal') === String(index));
    });

    overlay.classList.add('active');
    stopAutoplay();
}

function closeBannerModal() {
    const overlay = document.getElementById('banner-modal-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    startAutoplay();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeBannerModal();
        closeHelpModal();
        closeMobileMenu();
    }
});

// ==========================================================================
// VISTA: INICIO (popup de formularios del Centro de Ayuda)
// ==========================================================================
function openHelpModal(key) {
    const overlay = document.getElementById('help-modal-overlay');
    if (!overlay) return;

    document.querySelectorAll('.help-modal-content').forEach(content => {
        content.classList.toggle('active', content.getAttribute('data-help-modal') === key);
    });

    overlay.classList.add('active');
    stopAutoplay();
}

function closeHelpModal() {
    const overlay = document.getElementById('help-modal-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    startAutoplay();
}

// ==========================================================================
// VISTAS DE TRÁMITE: acordeón de pasos (domicilio, visa, vales)
// ==========================================================================
function initAccordionView() {
    document.querySelectorAll('.latam-step-trigger').forEach(button => {
        button.addEventListener('click', () => {
            const stepElement = button.parentElement;
            const bodyElement = button.nextElementSibling;

            stepElement.classList.toggle('active');

            if (stepElement.classList.contains('active')) {
                bodyElement.style.maxHeight = bodyElement.scrollHeight + "px";
            } else {
                bodyElement.style.maxHeight = null;
            }
        });
    });

    const initialStep = document.querySelector('.latam-step');
    if (initialStep) {
        initialStep.classList.add('active');
        const body = initialStep.querySelector('.latam-step-body');
        body.style.maxHeight = body.scrollHeight + "px";
    }
}

// ==========================================================================
// VISTA: VISA / PASAPORTE (formulario dinámico según motivo)
// ==========================================================================
function initVisaFormLogic() {
    const radioRechazo = document.getElementById('opt-rechazada');
    if (!radioRechazo) return;

    const radiosNormales = document.querySelectorAll('input[name="visa-type"]:not(#opt-rechazada)');
    const grpNum = document.getElementById('grp-doc-num');
    const grpDate = document.getElementById('grp-doc-date');
    const uploadLabel = document.getElementById('upload-label');
    const uploadP = document.getElementById('upload-p');

    function toggleFormFields() {
        if (radioRechazo.checked) {
            grpNum.style.display = 'none';
            grpDate.style.display = 'none';
            uploadLabel.innerHTML = 'Adjuntar constancia consular de rechazo *';
            uploadP.innerHTML = '<strong>Sube aquí el sustento del consulado</strong> para levantar las protecciones de inmediato.';
        } else {
            grpNum.style.display = 'block';
            grpDate.style.display = 'block';
            uploadLabel.innerHTML = 'Adjuntar archivo digital del documento emitido *';
            uploadP.innerHTML = '<strong>Haz clic aquí</strong> para subir el escaneo o foto legible';
        }

        const formStep = radioRechazo.closest('.latam-step-body');
        if (formStep) formStep.style.maxHeight = formStep.scrollHeight + "px";
    }

    radioRechazo.addEventListener('change', toggleFormFields);
    radiosNormales.forEach(r => r.addEventListener('change', toggleFormFields));
}

function handleVisaFormSubmit() {
    const radioRechazo = document.getElementById('opt-rechazada');
    if (radioRechazo && radioRechazo.checked) {
        alert('Alerta enviada a Soporte SAB. Se procederá a levantar tus protecciones operativas de Rol de forma prioritaria.');
    } else {
        alert('Documento enviado a revisión. Espera la confirmación de Soporte SAB para la actualización en bases de datos y asignación de vuelos internacionales.');
    }
}

// ==========================================================================
// COMPONENTE: CARRUSEL DE TARJETAS (multi-instancia, cíclico infinito, con swipe)
// Se usa en Gestión Operativa, Datos Personales y Mi Rol.
// ==========================================================================
const cardCarousels = {};

function initCardCarousel(key) {
    const wrapper = document.querySelector(`.go-carousel-wrapper[data-carousel="${key}"]`);
    if (!wrapper) return;

    const track = wrapper.querySelector('.go-carousel-track');
    const originalCards = Array.from(track.children);
    const n = originalCards.length;
    if (n === 0) return;

    // Triplicamos las tarjetas para poder girar en un solo sentido sin
    // que se note el salto al pasar de la última a la primera.
    track.innerHTML = '';
    for (let copy = 0; copy < 3; copy++) {
        originalCards.forEach(card => track.appendChild(card.cloneNode(true)));
    }

    cardCarousels[key] = {
        track,
        wrapper,
        cards: track.querySelectorAll('.go-card'),
        n,
        index: n, // arranca en la copia del medio
        snapTimeout: null
    };

    positionCardCarousel(key, false);
    enableCarouselSwipe(key);
}

function ensureCardCarousel(key) {
    if (cardCarousels[key]) {
        positionCardCarousel(key, false);
    } else {
        initCardCarousel(key);
    }
}

function positionCardCarousel(key, animate) {
    const state = cardCarousels[key];
    if (!state) return;
    const { cards, index, track } = state;

    cards.forEach((card, i) => {
        card.classList.remove('is-active', 'is-near');
        const distance = Math.abs(i - index);
        if (distance === 0) {
            card.classList.add('is-active');
        } else if (distance === 1) {
            card.classList.add('is-near');
        }
    });

    if (!animate) track.style.transition = 'none';

    const activeCard = cards[index];
    const viewport = track.parentElement;
    const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
    const offset = viewport.offsetWidth / 2 - cardCenter;
    track.style.transform = `translateX(${offset}px)`;

    if (!animate) {
        void track.offsetWidth; // fuerza reflow antes de restaurar la transición
        track.style.transition = '';
    }
}

function moveCardCarousel(key, delta) {
    const state = cardCarousels[key];
    if (!state) return;

    state.index += delta;
    positionCardCarousel(key, true);

    // Tras la animación, si salimos del tercio central del listado triplicado,
    // saltamos sin transición al tercio equivalente (mismo contenido, sin salto visible).
    clearTimeout(state.snapTimeout);
    state.snapTimeout = setTimeout(() => {
        const { n } = state;
        if (state.index < n) {
            state.index += n;
            positionCardCarousel(key, false);
        } else if (state.index >= n * 2) {
            state.index -= n;
            positionCardCarousel(key, false);
        }
    }, 480);
}

function enableCarouselSwipe(key) {
    const state = cardCarousels[key];
    if (!state) return;

    const viewport = state.wrapper.querySelector('.go-carousel-viewport');
    if (!viewport) return;

    let startX = null;

    viewport.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
    });
    viewport.addEventListener('pointerup', (e) => {
        if (startX === null) return;
        const deltaX = e.clientX - startX;
        startX = null;
        if (Math.abs(deltaX) > 40) {
            moveCardCarousel(key, deltaX < 0 ? 1 : -1);
        }
    });
    viewport.addEventListener('pointerleave', () => {
        startX = null;
    });
}

function showGoDetail(index) {
    const panel = document.getElementById('go-detail-panel');
    if (!panel) return;

    document.querySelectorAll('.go-detail-content').forEach(content => {
        content.classList.toggle('active', content.getAttribute('data-detail') === String(index));
    });

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==========================================================================
// VISTA: MIS DATOS PERSONALES (pestañas laterales)
// ==========================================================================
function switchTab(tabId, element, carouselKey) {
    document.querySelectorAll('.tab-content-block').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');

    if (carouselKey) {
        ensureCardCarousel(carouselKey);
    }
}
