import { productos, clientes, transacciones, gastos, setTransacciones, currentCart, setCurrentCart } from '../state.js';
import { formatCurrency, showToast, openModal, closeModal, getTodayString } from '../utils.js';
import { initDeudasView } from './deudas.js'; // Importar para actualizar deudas

function renderizarVentas(fecha) {
    const listaTransaccionesEl = document.getElementById('lista-transacciones');
    listaTransaccionesEl.innerHTML = '';
    const transaccionesDelDia = transacciones.filter(t => t.fecha === fecha);
    
    let totalDelDia = 0;

    if (transaccionesDelDia.length === 0) {
        listaTransaccionesEl.innerHTML = '<p>No hay ventas registradas para este día.</p>';
    } else {
        transaccionesDelDia.forEach(t => {
            const cliente = clientes.find(c => c.id === t.cliente_id);
            const itemEl = document.createElement('div');
            itemEl.className = 'item';
            let amountClass = t.metodo_pago === 'credito' ? 'credit' : 'cash';
            
            itemEl.innerHTML = `
                <div class="details">
                    <p class="description">${t.descripcion}</p>
                    <p class="meta">${cliente ? cliente.nombre : 'N/A'} - ${t.metodo_pago}</p>
                </div>
                <div class="amount ${amountClass}">${formatCurrency(t.valor)}</div>
                <div class="item-actions-sale">
                    <button class="btn-editar-venta" data-id="${t.id}">✏️</button>
                    <button class="btn-eliminar-venta" data-id="${t.id}">🗑️</button>
                </div>`;
            listaTransaccionesEl.appendChild(itemEl);
            totalDelDia += t.valor;
        });
    }
    
    const gastoDelDia = gastos.find(g => g.fecha === fecha);
    const montoGasto = gastoDelDia ? gastoDelDia.monto : 0;
    document.getElementById('daily-expense-amount').value = montoGasto > 0 ? montoGasto : '';
    
    document.getElementById('daily-totals-summary').textContent = `Total: ${formatCurrency(totalDelDia)}`;
}

function setupVentaModal(transactionId = null) {
    const isEditMode = transactionId !== null;
    const modalTitle = document.getElementById('sale-modal-title');
    const productListEl = document.getElementById('modal-product-list');
    const cartItemsEl = document.getElementById('modal-cart-items');
    const cartTotalEl = document.getElementById('modal-cart-total');
    const selectCliente = document.getElementById('cliente-id');
    const paymentButtons = document.querySelectorAll('#modal-nueva-transaccion .payment-btn');
    const formVenta = document.getElementById('form-nueva-transaccion');
    const saleIdInput = document.getElementById('sale-id');
    setCurrentCart([]);

    function renderProductsInModal() {
        productListEl.innerHTML = '';
        productos.forEach(p => {
            const itemEl = document.createElement('div');
            itemEl.className = 'product-item';
            itemEl.dataset.productId = p.id;
            itemEl.innerHTML = `<span class="name">${p.nombre}</span><span class="product-counter hidden"></span>`;
            
            let pressTimer;
            itemEl.addEventListener('click', () => addProductToCart(p.id));
            itemEl.addEventListener('touchstart', (e) => {
                pressTimer = window.setTimeout(() => {
                    e.preventDefault();
                    removeProductFromCart(p.id);
                }, 500);
            });
            itemEl.addEventListener('touchend', () => clearTimeout(pressTimer));
            itemEl.addEventListener('touchmove', () => clearTimeout(pressTimer));

            productListEl.appendChild(itemEl);
        });
    }

    function addProductToCart(productId) {
        const product = productos.find(p => p.id === productId);
        const existingItem = currentCart.find(item => item.id === productId);
        if (existingItem) existingItem.cantidad++;
        else currentCart.push({ ...product, cantidad: 1 });
        renderCart();
    }
    
    function removeProductFromCart(productId) {
        const existingItem = currentCart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.cantidad--;
            if (existingItem.cantidad <= 0) {
                setCurrentCart(currentCart.filter(item => item.id !== productId));
            }
            renderCart();
        }
    }

    function changeQuantity(productId, change) {
        const cartItem = currentCart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.cantidad += change;
            if (cartItem.cantidad <= 0) setCurrentCart(currentCart.filter(item => item.id !== productId));
        }
        renderCart();
    }

    function renderCart() {
        if (currentCart.length === 0) {
            cartItemsEl.innerHTML = '<p>Selecciona productos de la lista...</p>';
            cartTotalEl.textContent = 'Total: $0';
        } else {
            cartItemsEl.innerHTML = '';
            let total = 0;
            currentCart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <span class="name">${item.nombre}</span>
                    <div class="quantity-controls">
                        <button type="button" class="btn-qty-change" data-id="${item.id}" data-change="-1">-</button>
                        <span>${item.cantidad}</span>
                        <button type="button" class="btn-qty-change" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <span class="price">${formatCurrency(item.precio * item.cantidad)}</span>`;
                cartItemsEl.appendChild(itemEl);
                total += item.precio * item.cantidad;
            });
            cartTotalEl.textContent = `Total: ${formatCurrency(total)}`;
        }
        updateProductSelection();
    }
    
    function updateProductSelection() {
        document.querySelectorAll('#modal-product-list .product-item').forEach(el => {
            const productId = parseInt(el.dataset.productId);
            const itemInCart = currentCart.find(item => item.id === productId);
            const counter = el.querySelector('.product-counter');

            if (itemInCart) {
                el.classList.add('selected');
                counter.textContent = itemInCart.cantidad;
                counter.classList.remove('hidden');
            } else {
                el.classList.remove('selected');
                counter.classList.add('hidden');
            }
        });
    }
    
    function parseDescriptionToCart(description) {
        const items = description.split(', ');
        const cart = [];
        items.forEach(itemString => {
            const match = itemString.match(/(.+) \(x(\d+)\)/);
            if (match) {
                const [, nombre, cantidad] = match;
                const product = productos.find(p => p.nombre === nombre);
                if (product) {
                    cart.push({ ...product, cantidad: parseInt(cantidad) });
                }
            }
        });
        return cart;
    }

    modalTitle.textContent = isEditMode ? 'Editar Venta' : 'Nueva Venta';
    renderProductsInModal();
    selectCliente.innerHTML = '<option value="">Seleccione un comprador...</option>' + clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    
    if (isEditMode) {
        const tx = transacciones.find(t => t.id === transactionId);
        if (tx) {
            saleIdInput.value = tx.id;
            setCurrentCart(parseDescriptionToCart(tx.descripcion));
            selectCliente.value = tx.cliente_id;
            paymentButtons.forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.method === tx.metodo_pago);
            });
            renderCart();
        }
    }

    paymentButtons.forEach(button => button.addEventListener('click', () => {
        paymentButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    }));
    
    cartItemsEl.addEventListener('click', e => {
        if (e.target.classList.contains('btn-qty-change')) {
            const productId = parseInt(e.target.dataset.id);
            const change = parseInt(e.target.dataset.change);
            changeQuantity(productId, change);
        }
    });

    formVenta.addEventListener('submit', e => {
        e.preventDefault();
        const metodoPago = document.querySelector('#modal-nueva-transaccion .payment-btn.selected')?.dataset.method;
        
        let errors = [];
        if (currentCart.length === 0) errors.push('Añada productos al carrito.');
        if (!selectCliente.value) errors.push('Seleccione un comprador.');
        if (!metodoPago) errors.push('Seleccione un método de pago.');

        if (errors.length > 0) {
            showToast(errors.join(' '));
            return;
        }
        
        const saleData = {
            fecha: document.getElementById('fecha-seleccionada').value,
            descripcion: currentCart.map(item => `${item.nombre} (x${item.cantidad})`).join(', '),
            valor: currentCart.reduce((total, item) => total + (item.precio * item.cantidad), 0),
            metodo_pago: metodoPago,
            cliente_id: parseInt(selectCliente.value),
            estado_deuda: metodoPago === 'credito' ? 'pendiente' : 'pagada'
        };

        if (isEditMode) {
            const txId = parseInt(saleIdInput.value);
            const txIndex = transacciones.findIndex(t => t.id === txId);
            if (txIndex !== -1) {
                transacciones[txIndex] = { ...transacciones[txIndex], ...saleData };
            }
        } else {
             transacciones.unshift({ ...saleData, id: Date.now() });
        }

        closeModal();
        renderizarVentas(document.getElementById('fecha-seleccionada').value);
        initDeudasView();
    });
}

export function initVentasView() {
    const fechaInput = document.getElementById('fecha-seleccionada');
    const dailyExpenseInput = document.getElementById('daily-expense-amount');
    const listaTransaccionesEl = document.getElementById('lista-transacciones');

    renderizarVentas(fechaInput.value);

    fechaInput.oninput = () => renderizarVentas(fechaInput.value);

    dailyExpenseInput.oninput = (e) => {
        const fecha = fechaInput.value;
        const monto = parseInt(e.target.value) || 0;
        
        let gastoExistente = gastos.find(g => g.fecha === fecha);
        if (gastoExistente) {
            if (monto > 0) {
                 gastoExistente.monto = monto;
            } else {
                gastos = gastos.filter(g => g.fecha !== fecha);
            }
        } else if (monto > 0) {
            gastos.push({ fecha, monto, nota: '' });
        }
        renderizarVentas(fecha);
    };

    listaTransaccionesEl.onclick = (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const transactionId = parseInt(target.dataset.id);

        if (target.classList.contains('btn-editar-venta')) {
            openModal('nuevaVenta', () => setupVentaModal(transactionId));
        }
        if (target.classList.contains('btn-eliminar-venta')) {
            openModal('confirmarEliminacion', () => {
                document.getElementById('btn-confirmar-eliminar').onclick = () => {
                    setTransacciones(transacciones.filter(t => t.id !== transactionId));
                    closeModal();
                    renderizarVentas(fechaInput.value);
                    initDeudasView();
                };
            });
        }
    };
    
    document.getElementById('btn-nueva-venta').onclick = () => openModal('nuevaVenta', () => setupVentaModal());
}