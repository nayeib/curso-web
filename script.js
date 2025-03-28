// Array para almacenar los productos
let productos = [];

// Array para almacenar los productos en el carrito
let carrito = [];

// Función para actualizar la notificación del carrito
function actualizarNotificacionCarrito() {
    const notificacion = document.getElementById('notificacionCarrito');
    const carritoBtn = document.querySelector('button[onclick="mostrarLista(\'carrito\')"]');
    if (carrito.length > 0) {
        notificacion.style.display = 'inline-block';
        notificacion.style.backgroundColor = 'red';
        notificacion.style.width = '10px';
        notificacion.style.height = '10px';
        notificacion.style.borderRadius = '50%';
        notificacion.style.position = 'relative';
        notificacion.style.top = '-8px';
        notificacion.style.right = '-8px';
        carritoBtn.style.position = 'relative';
    } else {
        notificacion.style.display = 'none';
    }
}

// Función para agregar productos al carrito
function agregarAlCarrito(nombre, precio, productoDiv) {
    carrito.push({ nombre, precio });
    
    // Aplicar animación al agregar al carrito
    if (productoDiv) {
        productoDiv.classList.add('agregando');
        setTimeout(() => {
            productoDiv.classList.remove('agregando');
        }, 500);
    }
    
    actualizarNotificacionCarrito();
    actualizarCarrito();
    actualizarBotonFlotanteCarrito();
}

// Función para actualizar el botón flotante del carrito
function actualizarBotonFlotanteCarrito() {
    const botonFlotante = document.querySelector('.floating-cart-button');
    if (carrito.length > 0 && document.querySelector('#productos').classList.contains('activa')) {
        botonFlotante.style.display = 'block';
        botonFlotante.textContent = `Ir al carrito (${carrito.length})`;
        botonFlotante.onclick = () => mostrarLista('carrito');
    } else {
        botonFlotante.style.display = 'none';
    }
}

// Función para actualizar la vista del carrito
function actualizarCarrito() {
    const carritoDiv = document.getElementById('carrito');
    if (carrito.length === 0) {
        carritoDiv.innerHTML = '<p id="mensajeCarrito">No hay productos en el carrito aún.</p>';
        actualizarBotonFlotanteCarrito();
        return;
    }

    let total = 0;
    let contenidoCarrito = '<div class="carrito-items">';
    
    carrito.forEach((producto, index) => {
        total += producto.precio;
        const nombreImagen = producto.nombre.replace(/ /g, '-');
        contenidoCarrito += `
            <div class="carrito-item">
                <img src="imagenes/${nombreImagen}.jpg" alt="${producto.nombre}" class="carrito-item-img" onerror="this.src='imagenes/not-found.webp'" style="max-width: 100px; height: auto;">
                <span>${producto.nombre}</span>
                <span>€${producto.precio.toFixed(2)}</span>
                <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </div>
        `;
    });

    contenidoCarrito += `
        <div class="carrito-total">
            <strong>Total: €${total.toFixed(2)}</strong>
        </div>
    </div>`;

    if (carrito.length > 0) {
        contenidoCarrito += '<button id="comprar-btn" onclick="comprar()">Comprar por WhatsApp</button>';
    }

    carritoDiv.innerHTML = contenidoCarrito;
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarNotificacionCarrito();
    actualizarCarrito();
}

// Función para realizar la compra vía WhatsApp
function comprar() {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    let mensaje = 'Hola me gustaría comprar:\n';
    let total = 0;

    carrito.forEach(producto => {
        mensaje += `- ${producto.nombre}: €${producto.precio.toFixed(2)}\n`;
        total += producto.precio;
    });

    mensaje += `\nTotal: €${total.toFixed(2)}`;
    
    // Codificar el mensaje para la URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    window.open(`https://wa.me/34614227487?text=${mensajeCodificado}`);
}

// Función para actualizar el total del carrito
function actualizarTotal() {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    document.getElementById('total').textContent = `Total: €${total.toFixed(2)}`;
}

// Función para generar el mensaje de WhatsApp
function generarMensajeWhatsApp() {
    let mensaje = 'Hola quiero comprar:\n';
    carrito.forEach(item => {
        mensaje += `${item.cantidad}x ${item.nombre} - €${(item.precio * item.cantidad).toFixed(2)}\n`;
    });
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    mensaje += `\nTotal: €${total.toFixed(2)}`;
    return encodeURIComponent(mensaje);
}

// Configurar el botón de WhatsApp
document.getElementById('whatsapp-btn').onclick = function() {
    window.open('https://wa.me/34614227487');
};

// Función para cargar los productos desde el CSV
async function cargarProductos() {
    try {
        const response = await fetch('Productos.csv');
        const data = await response.text();
        const lines = data.split('\n');
        
        // Procesar el CSV (saltamos la primera línea que son los encabezados)
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            // Dividir la línea por comas, respetando las comillas
            const valores = lines[i].match(/(?:"([^"]*)"|([^,]+))/g);
            if (!valores) continue;
            
            // Limpiar las comillas y espacios
            const datosProducto = valores.map(val => val.replace(/\"|\s+$/g, ''));
            
            productos.push({
                nombre: datosProducto[0],
                categoria: datosProducto[1],
                precio: parseFloat(datosProducto[2]),
                cantidad: parseFloat(datosProducto[3])
            });
        }

        // Obtener categorías únicas
        const categoriasUnicas = ['Todos', ...new Set(productos.map(p => p.categoria))];
        
        // Obtener el contenedor de categorías
        const categoriasContainer = document.getElementById('categorias');
        categoriasContainer.innerHTML = '';

        // Crear los botones de categorías dinámicamente
        categoriasUnicas.forEach(categoria => {
            const button = document.createElement('button');
            button.textContent = categoria;
            button.classList.add('categoria-btn');
            button.onclick = () => mostrarProductos(categoria);
            categoriasContainer.appendChild(button);
        });

        // Mostrar todos los productos inicialmente
        mostrarProductos('Todos');

    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Función que maneja el clic en los botones de categoría
function mostrarProductos(categoria, searchTerm = '') {
    const productosContainer = document.getElementById('productos');
    productosContainer.innerHTML = '';
    productosContainer.classList.add('grid-container');
    
    // Agregar barra de búsqueda si no existe
    let searchContainer = document.querySelector('.search-container');
    if (!searchContainer) {
        searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" class="search-input" placeholder="Buscar productos..." value="${searchTerm}">
            <button class="clear-search">×</button>
        `;
        productosContainer.parentElement.insertBefore(searchContainer, productosContainer);

        // Eventos de la barra de búsqueda
        const searchInput = searchContainer.querySelector('.search-input');
        const clearButton = searchContainer.querySelector('.clear-search');

        searchInput.addEventListener('input', (e) => {
            mostrarProductos(categoria, e.target.value);
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            mostrarProductos(categoria, '');
        });

        // Manejar la posición fija de la barra de búsqueda
        window.addEventListener('scroll', () => {
            const navBar = document.querySelector('nav');
            const navBarBottom = navBar.getBoundingClientRect().bottom;
            if (navBarBottom <= 0 && document.querySelector('#productos').classList.contains('activa')) {
                searchContainer.classList.add('fixed');
            } else {
                searchContainer.classList.remove('fixed');
            }
        });
    }

    // Mostrar u ocultar la barra de búsqueda según la sección activa
    searchContainer.style.display = document.querySelector('#productos').classList.contains('activa') ? 'block' : 'none';
    
    let productosFiltrados = categoria === 'Todos' 
        ? productos 
        : productos.filter(p => p.categoria.trim() === categoria.trim());

    // Filtrar por término de búsqueda
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(searchLower) ||
            p.categoria.toLowerCase().includes(searchLower)
        );
    }

    // Ordenar productos: destacados primero
    productosFiltrados.sort((a, b) => {
        if (a.destacado === 'si' && b.destacado !== 'si') return -1;
        if (a.destacado !== 'si' && b.destacado === 'si') return 1;
        return 0;
    });

    productosFiltrados.forEach(producto => {
        if (producto.cantidad > 0) {
            const productoDiv = document.createElement('div');
            productoDiv.className = 'producto';
            
            const img = new Image();
            const nombreImagen = producto.nombre.replace(/ /g, '-');
            img.src = `imagenes/${nombreImagen}.jpg`;
            img.alt = producto.nombre;
            img.className = 'icono-transparente-productoImg';

            img.onload = function() {
                productoDiv.appendChild(img);
            };

            img.onerror = function() {
                img.src = 'imagenes/not-found.webp';
                productoDiv.appendChild(img);
            };

            const nombreContainer = document.createElement('div');
            nombreContainer.className = 'nombre-producto';
            const h3 = document.createElement('h3');
            h3.textContent = producto.nombre;
            
            // Calcular si el texto necesita animación (más de 4 líneas)
            const tempDiv = document.createElement('div');
            tempDiv.style.cssText = 'position: absolute; visibility: hidden; height: auto; width: ' + nombreContainer.offsetWidth + 'px;';
            tempDiv.innerHTML = producto.nombre;
            document.body.appendChild(tempDiv);
            const height = tempDiv.offsetHeight;
            document.body.removeChild(tempDiv);
            
            if (height > 80) { // Aproximadamente 4 líneas (20px por línea)
                h3.classList.add('scroll');
            }
            
            nombreContainer.appendChild(h3);
            productoDiv.appendChild(nombreContainer);

            const p = document.createElement('p');
            p.textContent = `€${producto.precio.toFixed(2)}`;
            productoDiv.appendChild(p);

            const button = document.createElement('button');
            button.textContent = 'Agregar';
            button.className = 'agregar-carrito';
            button.onclick = () => {
                agregarAlCarrito(producto.nombre, producto.precio, productoDiv);
                productoDiv.classList.add('producto-agregado');
                setTimeout(() => {
                    productoDiv.classList.remove('producto-agregado');
                }, 500);
            };
            productoDiv.appendChild(button);

            // Agregar funcionalidad de vista detallada
            img.addEventListener('click', () => {
                productoDiv.classList.add('vista-detallada');
                
                const overlay = document.createElement('div');
                overlay.className = 'overlay activo';
                document.body.appendChild(overlay);

                const cerrarBtn = document.createElement('button');
                cerrarBtn.className = 'cerrar-detalle';
                cerrarBtn.innerHTML = '×';
                cerrarBtn.onclick = () => {
                    productoDiv.classList.remove('vista-detallada');
                    overlay.remove();
                    cerrarBtn.remove();
                    if (descripcion) descripcion.remove();
                };

                const descripcion = document.createElement('div');
                descripcion.className = 'descripcion-producto';
                descripcion.textContent = producto.descripcion || 'No hay descripción disponible';

                productoDiv.appendChild(cerrarBtn);
                productoDiv.appendChild(descripcion);
            });

            productosContainer.appendChild(productoDiv);
        }
    });

    // Cambiar a la sección de productos
    mostrarLista('productos');
    
    // Actualizar botón flotante del carrito
    actualizarBotonFlotanteCarrito();
}



// Cargar productos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarProductos);

function mostrarLista(divId) {
    // Primero, ocultamos todos los divs con la clase "lista"
    const divs = document.querySelectorAll('.lista');
    divs.forEach(div => {
        div.classList.remove('activa');
        div.classList.add('oculto'); // Ocultamos todos los divs
    });

    // Luego, mostramos el div que corresponde al ID seleccionado
    const divActivo = document.getElementById(divId);
    divActivo.classList.remove('oculto'); // Quitamos la clase "oculto" para mostrarlo
    divActivo.classList.add('activa'); // Agregamos la clase "activa"

    // Mostrar u ocultar elementos según la sección activa
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        searchContainer.style.display = divId === 'productos' ? 'block' : 'none';
    }
    actualizarBotonFlotanteCarrito();
}


