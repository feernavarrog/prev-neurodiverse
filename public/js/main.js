// Función para obtener los parámetros de la URL
// Ejemplo de uso: http://localhost:3000/products?filter=tecnologia
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        filter: params.get('filter') || 'default',
        code: params.get('code') || '(ID en BBDD)'
    };
}

// Función para cargar los productos según el filtro de la URL
function loadProducts() {
    const queryData = getQueryParams();
    console.log("Filtro seleccionado:", queryData.filter);

    // Aquí se realizará una llamada AJAX a la ruta '/products'
    // pasando el filtro como parámetro en la URL.
    // Esta función consultará la base de datos y generará dinámicamente
    // los productos en la sección 'product-list'.
}

// Función para cargar los detalles del producto en la vista
function loadProductDetails() {
    const queryData = getQueryParams();
    console.log("Código del producto recibido:", queryData.code);

    // Insertar el código del producto en el elemento correspondiente del HTML
    document.getElementById('item-code').innerText = queryData.code;

    // Aquí se realizará una llamada AJAX a la ruta '/item/{codigo}'
    // para obtener los detalles del producto desde la base de datos.
    // Una vez obtenidos, se actualizarán dinámicamente los elementos en la página.
}

// Función para agregar el producto al carrito almacenado en sessionStorage
function addToCart() {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    // Obtener los datos actuales del producto desde el DOM
    const productData = {
        name: document.getElementById('item-name').innerText,
        image: document.getElementById('item-image').src,
        description: document.getElementById('item-description').innerText,
        code: document.getElementById('item-code').innerText,
        price: document.getElementById('item-price').innerText
    };

    // Agregar el producto al carrito
    cart.push(productData);

    // Guardar en sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(cart));

    console.log("Producto agregado al carrito:", productData);
    console.log("Carrito actual en sessionStorage:", JSON.parse(sessionStorage.getItem('cart')));

    // Llamar a la función que actualizará la vista del carrito
    updateCart();
}

// Función para actualizar el carrito con los datos almacenados en sessionStorage
function updateCart() {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    let cartContainer = document.getElementById('cart-items');
    let totalContainer = document.getElementById('cart-total');
    cartContainer.innerHTML = "";
    let total = 0;

    cart.forEach(product => {
        let productElement = document.createElement('div');
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div>
                <p>${product.name}</p>
                <select class="quantity-selector" data-code="${product.code}">
                    ${[1,2,3,4,5,6].map(num => `<option value="${num}" ${product.quantity == num ? 'selected' : ''}>${num}</option>`).join('')}
                </select>
                <p>${product.price}</p>
            </div>
            <button class="remove-item" data-code="${product.code}"><i class="fas fa-trash"></i></button>
        `;
        cartContainer.appendChild(productElement);
        total += parseFloat(product.price.replace('$', '').trim()) * (product.quantity || 1);
    });

    totalContainer.innerText = `$${total.toFixed(2)}`;

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            removeFromCart(this.getAttribute('data-code'));
        });
    });

    document.querySelectorAll('.quantity-selector').forEach(select => {
        select.addEventListener('change', function() {
            updateQuantity(this.getAttribute('data-code'), this.value);
        });
    });
}

// Función para actualizar la cantidad de un producto en el carrito
function updateQuantity(productCode, newQuantity) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.map(product => {
        if (product.code === productCode) {
            product.quantity = parseInt(newQuantity, 10);
        }
        return product;
    });
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Función para eliminar un producto del carrito
function removeFromCart(productCode) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(product => product.code !== productCode);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Funciones para abrir y cerrar el carrito
function openCart() {
    document.getElementById("cart").classList.add("show-cart");
}
function closeCart() {
    document.getElementById("cart").classList.remove("show-cart");
}

// Funciones para abrir y cerrar el sidebar
function openSidebar() {
    document.getElementById("sidebar").classList.add("show-sidebar");
}
function closeSidebar() {
    document.getElementById("sidebar").classList.remove("show-sidebar");
}

// Función para abrir el modal de login
function openLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}

// Función para cerrar el modal de login
function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}

// Esperar a que el DOM cargue completamente
document.addEventListener('DOMContentLoaded', function () {
    // Botón del icono de usuario para abrir el modal
    let userToggleBtn = document.getElementById('user-toggle');
    if (userToggleBtn) {
        userToggleBtn.addEventListener('click', function (event) {
            event.preventDefault(); // Evita que el enlace recargue la página
            openLoginModal();
        });
    }

    // Botón para cerrar el modal
    let closeLoginBtn = document.getElementById('close-login');
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', closeLoginModal);
    }

    // Cerrar el modal si el usuario hace clic fuera del modal
    window.addEventListener('click', function (e) {
        let modal = document.getElementById('login-modal');
        if (e.target === modal) {
            closeLoginModal();
        }
    });

    // Inicializar eventos para abrir y cerrar el carrito y el sidebar
    let eventMapping = [
        { id: "menu-toggle", event: "click", handler: openSidebar },
        { id: "close-sidebar", event: "click", handler: closeSidebar },
        { id: "cart-toggle", event: "click", handler: openCart },
        { id: "close-cart", event: "click", handler: closeCart },
        { id: "login-btn", event: "click", handler: openLoginModal },
        { id: "close-login", event: "click", handler: closeLoginModal }
    ];

    eventMapping.forEach(({ id, event, handler }) => {
        let element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    });

    window.addEventListener('click', function(e) {
        let modal = document.getElementById('login-modal');
        if (e.target === modal) {
            closeLoginModal();
        }
    });
});

// Cargar los productos al iniciar la vista
window.onload = function() {
    const queryData = getQueryParams();
    if (queryData.code === '(ID en BBDD)') {
        loadProducts(); // Si es la página de productos, cargamos los productos.
    } else {
        loadProductDetails(); // Si es la página de detalles de producto, cargamos los detalles.
    }

    // Asignamos la función de agregar al carrito
    const addToCartButton = document.getElementById('add-to-cart');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', addToCart);
    }
};
