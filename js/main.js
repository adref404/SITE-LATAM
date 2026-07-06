// ==========================================================================
// HEADER: MEGA-MENÚ (persistente, no se reinicia entre vistas)
// ==========================================================================
function showMenu(id) {
    document.getElementById(id).style.display = 'grid';
    document.getElementById(id).parentElement.classList.add('active');
}

function hideMenu(id) {
    document.getElementById(id).style.display = 'none';
    document.getElementById(id).parentElement.classList.remove('active');
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
            initGoCarousel();
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
// VISTA: GESTIÓN OPERATIVA (carrusel de tarjetas con flechas)
// ==========================================================================
let goCarouselCards = [];
let goCarouselIndex = 0;

function initGoCarousel() {
    goCarouselCards = document.querySelectorAll('#go-carousel-track .go-card');
    goCarouselIndex = 0;
    updateGoCarousel();
}

function updateGoCarousel() {
    if (!goCarouselCards.length) return;

    const n = goCarouselCards.length;
    goCarouselCards.forEach((card, i) => {
        card.classList.remove('is-active', 'is-near');
        const rawDistance = Math.abs(i - goCarouselIndex);
        const distance = Math.min(rawDistance, n - rawDistance);
        if (distance === 0) {
            card.classList.add('is-active');
        } else if (distance === 1) {
            card.classList.add('is-near');
        }
    });

    const track = document.getElementById('go-carousel-track');
    const activeCard = goCarouselCards[goCarouselIndex];
    const viewport = track.parentElement;
    const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
    const offset = viewport.offsetWidth / 2 - cardCenter;
    track.style.transform = `translateX(${offset}px)`;
}

function goCarouselMove(delta) {
    if (!goCarouselCards.length) return;
    const n = goCarouselCards.length;
    goCarouselIndex = (goCarouselIndex + delta + n) % n;
    updateGoCarousel();
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
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content-block').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}
