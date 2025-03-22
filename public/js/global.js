
// Funciones para abrir y cerrar el sidebar
function openSidebar() {
    document.getElementById("sidebar").classList.add("show-sidebar");
}
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("show-sidebar");
}

// Función para abrir el modal de login
function openLoginModal() {
    let modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = "block"; // Mostrar el modal
    }
}

// Función para cerrar el modal de login
function closeLoginModal() {
    let modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = "none"; // Ocultar el modal
    }
}

function formatCLP(value) {
    return `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function formatRUT(rut) {
    if (!rut || typeof rut !== 'string') return rut;

    // Eliminar puntos y guiones si vienen con formato
    rut = rut.replace(/\./g, '').replace(/-/g, '');

    // Separar el dígito verificador (último carácter)
    const dv = rut.slice(-1);
    let cuerpo = rut.slice(0, -1);

    // Insertar puntos cada 3 dígitos desde el final
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${cuerpo}-${dv}`;
}

function formatDate(fechaISO) {
    if (fechaISO.includes('/')) {
        return fechaISO; // Si ya está en formato DD/MM/YYYY, no convertir
    }
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateInput(fechaISO) {
    return fechaISO.split("T")[0]; // Formato YYYY-MM-DD para inputs tipo date
}

function formatDateToDB(dateString) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convierte DD/MM/YYYY a YYYY-MM-DD
    }
    return dateString; // Devuelve el mismo valor si ya está en YYYY-MM-DD
}

function cleanAndConvertCLP(priceString) {
    return parseFloat(priceString.replace('$', '').replace(/\./g, '').trim());
}

document.addEventListener("DOMContentLoaded", async function () {

    const sessionValid = await fetch('/users/check-session')
        .then(res => res.ok)
        .catch(err => {
            console.error("❌ Error al verificar sesión con el backend:", err);
            return false;
        });

    if (!sessionValid) {
        console.warn("⚠️ Sesión del backend no válida. Limpiando sessionStorage...");
        sessionStorage.removeItem('user');
    }

    // ✅ Ahora sí, ejecutamos el resto
    initApp();
});

// Función para inicializar la aplicación
function initApp() {
    console.log("🔹 Cargando configuración global...");

    // ✅ Verificar sesión de usuario
    const userSession = JSON.parse(sessionStorage.getItem("user"));
    const userToggleBtn = document.getElementById('user-toggle');

    if (userSession && userSession.userId) {
        console.log("Usuario en sesión:", userSession);

        if (userToggleBtn) {
            // ✅ Remover todos los eventos previos del botón
            let newUserToggleBtn = userToggleBtn.cloneNode(true);
            userToggleBtn.parentNode.replaceChild(newUserToggleBtn, userToggleBtn);

            // ✅ Agregar el evento correcto (redirigir en vez de abrir modal)
            newUserToggleBtn.addEventListener("click", function () {
                const targetPage = userSession.role === "admin" ? "/admin-panel" : "/account";
                window.location.href = targetPage;
            });
        }
    } else {
        // ✅ Si no hay sesión, asignar evento para abrir el modal de login
        if (userToggleBtn) {
            userToggleBtn.addEventListener("click", function (event) {
                event.preventDefault();
                openLoginModal();
            });
        }
    }

    // ✅ Eventos generales
    const eventMapping = [
        { id: "menu-toggle", event: "click", handler: openSidebar },
        { id: "close-sidebar", event: "click", handler: closeSidebar },
        { id: "cart-toggle", event: "click", handler: typeof openCart === "function" ? openCart : null },
        { id: "close-cart", event: "click", handler: typeof closeCart === "function" ? closeCart : null },
        { id: "login-btn", event: "click", handler: openLoginModal },
        { id: "close-login", event: "click", handler: closeLoginModal },
    ];
    
    eventMapping.forEach(({ id, event, handler }) => {
        if (handler) {
            let element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            }
        }
    });
    
    // ✅ Configuración del modal de login
    const loginModal = document.getElementById('login-modal');
    const closeLoginBtn = document.getElementById('close-login');

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', closeLoginModal);
    }

    window.addEventListener('click', function (e) {
        let modal = document.getElementById('login-modal');
        
        if (e.target === modal) {
            closeLoginModal();
        }
    });

    // ✅ Inicializar otras funciones si existen
    if (typeof updateCart === "function") updateCart();
    if (typeof loadSidebarCategories === "function") loadSidebarCategories();
};
