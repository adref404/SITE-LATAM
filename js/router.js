const routes = {
    "inicio": {
        html: "views/inicio.html",
        css: "css/home.css"
    },
    "mis-datos": {
        html: "views/mis_datos_personales.html",
        css: "css/tramites/mis_datos_personales.css"
    },
    "mi-rol": {
        html: "views/mi_rol.html",
        css: "css/tramites/mi_rol.css"
    },
    "gestion-operativa": {
        html: "views/gestion_operativa.html",
        css: "css/tramites/gestion_operativa.css"
    },
    "domicilio": {
        html: "views/actualizacion_domicilio.html",
        css: "css/tramites/actualizacion_domicilio.css"
    },
    "visa": {
        html: "views/procedimiento_visa_crewcare.html",
        css: "css/tramites/visa_crewcare.css"
    },
    "vales": {
        html: "views/vales_alimentacion.html",
        css: "css/tramites/vales_alimentacion.css"
    }
};

async function navigateTo(routeKey) {
    const route = routes[routeKey];
    if (!route) return;

    try {
        // 0. Liberar timers/listeners que pertenezcan a la vista actual
        cleanupView();

        // 1. Cambiar dinámicamente la hoja de estilos CSS de la vista
        document.getElementById('view-styles').setAttribute('href', route.css);

        // 2. Traer el fragmento HTML de la vista
        const response = await fetch(route.html);
        const htmlContent = await response.text();

        // 3. Inyectar el HTML en el contenedor principal (el header se conserva siempre)
        document.getElementById('app').innerHTML = htmlContent;
        window.scrollTo({ top: 0, behavior: 'instant' });

        // 4. Re-inicializar los listeners propios de la vista recién cargada
        initViewScripts(routeKey);

        // 5. Reflejar la ruta activa en el header
        updateActiveNav(routeKey);

        // 6. Marcar si estamos en Inicio (hero a pantalla completa + header transparente) y refrescar su estado
        document.body.classList.toggle('is-home', routeKey === 'inicio');
        updateHeaderOnScroll();

    } catch (error) {
        console.error("Error cargando la navegación:", error);
    }
}

function updateActiveNav(routeKey) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const currentLink = document.querySelector(`.nav-link[data-route="${routeKey}"]`);
    if (currentLink) {
        currentLink.closest('.nav-item').classList.add('active');
    }
}

// Escuchar los clics de navegación interna de forma global (header, megamenú y contenido)
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-route]');
    if (!target) return;
    e.preventDefault();

    const detailIndex = target.getAttribute('data-goto-detail');
    navigateTo(target.getAttribute('data-route')).then(() => {
        if (detailIndex !== null && typeof showGoDetail === 'function') {
            showGoDetail(detailIndex);
        }
    });
});

// Cargar la página de inicio por defecto al abrir el proyecto
window.addEventListener('DOMContentLoaded', () => {
    navigateTo('inicio');
});
