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
function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    actualizarNotificacionCarrito();
    actualizarCarrito();
}

// Función para actualizar la vista del carrito
function actualizarCarrito() {
    const carritoDiv = document.getElementById('carrito');
    if (carrito.length === 0) {
        carritoDiv.innerHTML = '<p id="mensajeCarrito">No hay productos en el carrito aún.</p>';
        return;
    }

    let total = 0;
    let contenidoCarrito = '<div class="carrito-items">';
    
    carrito.forEach((producto, index) => {
        total += producto.precio;
        contenidoCarrito += `
            <div class="carrito-item">
                <img src="imagenes/${producto.nombre}.jpg" alt="${producto.nombre}" class="carrito-item-img">
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
        <button id="comprar-btn" onclick="comprar()">Comprar por WhatsApp</button>
    </div>`;

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
                cantidad: parseFloat(datosProducto[1]),
                categoria: datosProducto[2],
                precio: parseFloat(datosProducto[6])
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
function mostrarProductos(categoria) {
    const productosContainer = document.getElementById('productos');
    productosContainer.innerHTML = '';
    
    const productosFiltrados = categoria === 'Todos' 
        ? productos 
        : productos.filter(p => p.categoria.trim() === categoria.trim());

    productosFiltrados.forEach(producto => {
        if (producto.cantidad > 0) {
            const productoDiv = document.createElement('div');
            productoDiv.className = 'producto';
            const img = new Image();
            img.src = `imagenes/${producto.nombre}.jpg`;
            img.className = 'icono-transparente-productoImg';
            img.alt = producto.nombre;
            img.onerror = function() {
                this.style.background = '#ffffff';
                this.style.width = '200px';
                this.style.height = '200px';
                this.src = 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"/>';
            };
            
            productoDiv.appendChild(img);
            productoDiv.innerHTML += `
                <h3>${producto.nombre}</h3>
                <p>€${producto.precio.toFixed(2)}</p>
                <button onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio})">Agregar</button>
            `;
            productosContainer.appendChild(productoDiv);
        }
    });
    
    // Cambiar a la sección de productos
    mostrarLista('productos');

}

// Cargar productos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarProductos);

function mostrarLista(divId) {
    // Primero, ocultamos todos los divs con la clase "lista"
    const divs = document.querySelectorAll('.lista');
    divs.forEach(div => {
        div.classList.add('oculto'); // Ocultamos todos los divs
    });

    // Luego, mostramos el div que corresponde al ID seleccionado
    const divActivo = document.getElementById(divId);
    divActivo.classList.remove('oculto'); // Quitamos la clase "oculto" para mostrarlo
}


