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
    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.nombre === nombre);
    
    if (productoExistente) {
        // Si el producto ya existe, incrementar la cantidad
        productoExistente.cantidad += 1;
    } else {
        // Si el producto no existe, agregarlo con cantidad 1
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    
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
        botonFlotante.textContent = `Ir al carrito `;
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
        // Calcular el subtotal para este producto
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;
        
        const nombreImagen = producto.nombre.replace(/ /g, '-');
        contenidoCarrito += `
            <div class="carrito-item">
                <img src="imagenes/${nombreImagen}.jpg" alt="${producto.nombre}" class="carrito-item-img" onerror="this.src='imagenes/not-found.webp'" style="max-width: 100px; height: auto;">
                <span>${producto.nombre}</span>
                <div class="cantidad-controles">
                    <button onclick="decrementarCantidad(${index})" class="btn-cantidad">-</button>
                    <span class="cantidad-valor">${producto.cantidad}</span>
                    <button onclick="incrementarCantidad(${index})" class="btn-cantidad">+</button>
                </div>
                <span>€${subtotal.toFixed(2)}</span>
                <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar">Eliminar</button>
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

// Función para incrementar la cantidad de un producto en el carrito
function incrementarCantidad(index) {
    carrito[index].cantidad += 1;
    actualizarCarrito();
}

// Función para decrementar la cantidad de un producto en el carrito
function decrementarCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
    } else {
        // Si la cantidad llega a 0, eliminar el producto
        eliminarDelCarrito(index);
    }
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
        const subtotal = producto.precio * producto.cantidad;
        mensaje += `- ${producto.cantidad}x ${producto.nombre}: €${subtotal.toFixed(2)}\n`;
        total += subtotal;
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
                cantidad: parseFloat(datosProducto[3]),
                descripcion: datosProducto[4] || '',
                oferta: datosProducto[5] ? datosProducto[5].trim() : '',
                destacado: datosProducto[6] || 'no'
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
// Función para mostrar el modal de producto
function mostrarModalProducto(producto) {
    const modalContainer = document.querySelector('.modal-container');
    const modalContent = modalContainer.querySelector('.modal-content');

    // Actualizar contenido del modal
    modalContent.querySelector('.product-name').textContent = producto.nombre;
    modalContent.querySelector('.product-description').textContent = producto.descripcion || 'Sin descripción disponible';
    
    // Actualizar etiqueta de destacado
    const featuredTag = modalContent.querySelector('.featured-tag');
    featuredTag.style.display = producto.destacado === 'si' ? 'inline-block' : 'none';

    // Configurar navegación de imágenes
    const nombreImagen = producto.nombre.replace(/ /g, '-');
    const imagenProducto = modalContent.querySelector('.product-image');
    imagenProducto.src = 'imagenes/loading.gif';
    const prevBtn = modalContent.querySelector('.prev-btn');
    const nextBtn = modalContent.querySelector('.next-btn');
    
    // Buscar todas las imágenes disponibles para este producto
    let imagenes = [];
    let imagenActual = 0;
    
    // Función para verificar si una imagen existe
    const verificarImagen = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    // Función para actualizar la imagen mostrada
    const actualizarImagen = () => {
        imagenProducto.src = 'imagenes/loading.gif';
        if (imagenes.length > 0) {
            const img = new Image();
            img.onload = () => {
                imagenProducto.src = imagenes[imagenActual];
            };
            img.src = imagenes[imagenActual];
        } else {
            imagenProducto.src = 'imagenes/not-found.webp';
        }
    };

    // Función para cargar las imágenes disponibles
    const cargarImagenes = async () => {
        const baseUrl = `imagenes/${nombreImagen}`;
        imagenes = [];
        
        // Verificar la imagen principal
        if (await verificarImagen(`${baseUrl}.jpg`)) {
            imagenes.push(`${baseUrl}.jpg`);
        }
        
        // Verificar imágenes adicionales (2, 3, etc.)
        let index = 2;
        while (await verificarImagen(`${baseUrl}${index}.jpg`)) {
            imagenes.push(`${baseUrl}${index}.jpg`);
            index++;
        }

        // Mostrar/ocultar botones de navegación según cantidad de imágenes
        if (imagenes.length > 1) {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
            prevBtn.style.backgroundColor = getComputedStyle(document.querySelector('.agregar-carrito')).backgroundColor;
            nextBtn.style.backgroundColor = getComputedStyle(document.querySelector('.agregar-carrito')).backgroundColor;
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        actualizarImagen();
    };

    // Configurar navegación
    prevBtn.onclick = (e) => {
        e.stopPropagation();
        imagenActual = (imagenActual - 1 + imagenes.length) % imagenes.length;
        actualizarImagen();
    };

    nextBtn.onclick = (e) => {
        e.stopPropagation();
        imagenActual = (imagenActual + 1) % imagenes.length;
        actualizarImagen();
    };

    // Iniciar carga de imágenes
    cargarImagenes();

    // Actualizar precios y oferta
    const offerTag = modalContent.querySelector('.offer-tag');
    const oldPrice = modalContent.querySelector('.old-price');
    const currentPrice = modalContent.querySelector('.current-price');
// Verificamos si la oferta es válida (no vacía ni nula)
// Verificamos si el campo oferta tiene un valor válido (no vacío, no nulo y no cero)
if (producto.oferta !== undefined && producto.oferta !== null && producto.oferta.trim() !== '') { 
    const descuento = parseFloat(producto.oferta); // Convertimos la oferta a número

    if (!isNaN(descuento) && descuento !== 0) { // Nos aseguramos de que sea un número válido y diferente de 0
        offerTag.style.display = 'inline-block';
        offerTag.textContent = `${descuento}%`; // Se muestra el porcentaje de descuento

        oldPrice.style.display = 'block';
        oldPrice.textContent = `€${producto.precio.toFixed(2)}`;

        // Calculamos el precio con descuento
        const precioOferta = producto.precio * (1 + descuento / 100);
        currentPrice.textContent = `€${precioOferta.toFixed(2)}`;
    } else {
        ocultarOferta(); // Si el valor no es válido, ocultamos la oferta
    }
} else {
    ocultarOferta(); // Si no hay oferta, se oculta
}

// Función para ocultar la oferta y mostrar solo el precio normal
function ocultarOferta() {
    offerTag.style.display = 'none';
    oldPrice.style.display = 'none';
    currentPrice.textContent = `€${producto.precio.toFixed(2)}`;
}



    // Configurar botón de agregar al carrito
    const addToCartBtn = modalContent.querySelector('.add-to-cart');
    addToCartBtn.onclick = () => {
        agregarAlCarrito(producto.nombre, producto.precio);
        
        // Aplicar animación a la imagen del producto antes de cerrar el modal
        const imagenProducto = modalContent.querySelector('.product-image');
        imagenProducto.classList.add('agregando');
        
        // Esperar a que termine la animación antes de cerrar el modal
        setTimeout(() => {
            imagenProducto.classList.remove('agregando');
            modalContainer.style.display = 'none';
        }, 500);
    };

    // Mostrar modal
    modalContainer.style.display = 'flex';

    // Configurar botón de cerrar
    const closeBtn = modalContent.querySelector('.close-btn');
    closeBtn.onclick = () => {
        imagenProducto.src = 'imagenes/loading.gif';
        modalContainer.style.display = 'none';
    };

    // Cerrar modal al hacer clic fuera del contenido
    modalContainer.onclick = (e) => {
        if (e.target === modalContainer) {
            modalContainer.style.display = 'none';
        }
    };
}

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
            productoDiv.onclick = () => mostrarModalProducto(producto);
            
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
            
 // Crear el contenedor para el nombre del producto
if (height > 80) { // Aproximadamente 4 líneas (20px por línea)
    h3.classList.add('scroll');
}
nombreContainer.appendChild(h3);
productoDiv.appendChild(nombreContainer);

// Crear el contenedor para el precio
const p = document.createElement('p');

// Crear el contenedor para la etiqueta de descuento (solo si hay oferta)
if (producto.oferta && producto.oferta.trim() !== '' && !isNaN(parseFloat(producto.oferta))) {
    const descuento = parseFloat(producto.oferta);
    const precioOferta = producto.precio * (1 + descuento / 100); // Aplicar descuento (descuento negativo resta)

    // Crear el texto con el porcentaje de descuento
    const descuentoTexto = document.createElement('span');
    descuentoTexto.classList.add('oferta'); // Se añade la clase CSS para estilizarlo
    descuentoTexto.textContent = `${descuento}%`; // Mostrar el descuento en formato "-30%"

    // Agregar el texto de descuento encima del precio
    productoDiv.appendChild(descuentoTexto);

    // Mostrar el precio con descuento
    p.textContent = `€${precioOferta.toFixed(2)}`; 
} else {
    // Si no hay oferta, solo mostrar el precio normal
    p.textContent = `€${producto.precio.toFixed(2)}`;
}

productoDiv.appendChild(p);

// Crear el botón "Agregar"
const button = document.createElement('button');
button.textContent = 'Agregar';

            button.className = 'agregar-carrito';
            button.onclick = (event) => {
                // Detener la propagación del evento para que no se abra la vista detallada
                event.stopPropagation();
                agregarAlCarrito(producto.nombre, producto.precio, productoDiv);
                productoDiv.classList.add('producto-agregado');
                setTimeout(() => {
                    productoDiv.classList.remove('producto-agregado');
                }, 500);
            };
            productoDiv.appendChild(button);

            // Vista detallada eliminada

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


