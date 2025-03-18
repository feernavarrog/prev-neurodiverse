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


