import { productos } from '../state.js';
import { formatCurrency, showToast, openModal, closeModal } from '../utils.js';

function setupProductoModal(producto = null) {
    const form = document.getElementById('form-producto');
    const title = document.getElementById('producto-modal-title');
    const idInput = document.getElementById('producto-id');
    const nombreInput = document.getElementById('producto-nombre');
    const precioInput = document.getElementById('producto-precio');

    if (producto) {
        title.textContent = 'Editar Producto';
        idInput.value = producto.id;
        nombreInput.value = producto.nombre;
        precioInput.value = producto.precio;
    } else {
        title.textContent = 'Añadir Nuevo Producto';
        form.reset();
    }

    form.onsubmit = (e) => {
        e.preventDefault();
        const id = parseInt(idInput.value);
        const updatedProduct = {
            id: id || Date.now(),
            nombre: nombreInput.value.trim(),
            precio: parseInt(precioInput.value)
        };

        if (!updatedProduct.nombre || isNaN(updatedProduct.precio) || updatedProduct.precio < 0) {
            showToast('Por favor, ingrese un nombre y precio válidos.');
            return;
        }

        if (id) {
            const index = productos.findIndex(p => p.id === id);
            if (index !== -1) productos[index] = updatedProduct;
        } else {
            productos.push(updatedProduct);
        }
        closeModal();
        initInventarioView();
    };
}

export function initInventarioView() {
    const listaInventarioEl = document.getElementById('lista-inventario');
    listaInventarioEl.innerHTML = '';
    if (productos.length === 0) {
        listaInventarioEl.innerHTML = '<p>No hay productos en el inventario.</p>';
    } else {
        productos.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(p => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item inventory-row';
            itemEl.innerHTML = `
                <div class="details"><p class="description">${p.nombre}</p></div>
                <div class="amount">${formatCurrency(p.precio)}</div>
                <div class="item-actions">
                    <button class="btn-editar-producto" data-id="${p.id}">✏️</button> <!-- CAMBIO: Icono de lápiz -->
                </div>`;
            listaInventarioEl.appendChild(itemEl);
        });
    }

    document.getElementById('view-inventario').onclick = (e) => {
        const target = e.target;
        if (target.id === 'btn-abrir-modal-producto') {
            openModal('producto', () => setupProductoModal());
        } else if (target.classList.contains('btn-editar-producto')) {
            const id = parseInt(target.dataset.id);
            const producto = productos.find(p => p.id === id);
            openModal('producto', () => setupProductoModal(producto));
        }
    };
}