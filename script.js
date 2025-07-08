document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DATOS TEMPORAL ---
    let productos = [
        { id: 1, nombre: 'Empanadas', precio: 2500 },
        { id: 2, nombre: 'Empanadas pequeñas', precio: 2000 },
        { id: 3, nombre: 'Papas rellenas', precio: 3500 },
        { id: 4, nombre: 'Pasteles de pollo', precio: 3500 },
        { id: 5, nombre: 'Café con leche', precio: 2500 },
        { id: 6, nombre: 'Tinto', precio: 1300 },
        { id: 7, nombre: 'Aromática', precio: 1000 },
        { id: 8, nombre: 'Gaseosa 7onz', precio: 1500 },
        { id: 9, nombre: 'Chocolate con leche', precio: 2500 },
    ];

    let clientes = [
        { id: 1, nombre: 'Ana García' },
        { id: 2, nombre: 'Carlos Ruiz' },
        { id: 3, nombre: 'Luisa Fernanda' },
        { id: 4, nombre: 'David Vélez' },
        { id: 5, nombre: 'James Rodríguez' },
    ];

    let transacciones = [
        {id: 1720401878356, fecha: "2025-07-07", descripcion: "Empanadas (x1)", valor: 2500, metodo_pago: "efectivo", cliente_id: 5, estado_deuda: "pagada"},
        {id: 1720401893043, fecha: "2025-07-07", descripcion: "Papas rellenas (x2), Gaseosa 7onz (x1)", valor: 8500, metodo_pago: "credito", cliente_id: 2, estado_deuda: "pendiente"},
        {id: 1720401905831, fecha: "2025-07-06", descripcion: "Café con leche (x1), Pasteles de pollo (x1)", valor: 6000, metodo_pago: "credito", cliente_id: 1, estado_deuda: "pendiente"}
    ];
    let pagos = [
        {id: 1720401920275, cliente_id: 1, monto: 2000, fecha: "2025-07-07"}
    ];
    let gastos = [
        {fecha: "2025-07-07", monto: 30000, nota: "Insumos para empanadas"}
    ];
    let currentCart = [];

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const navButtons = document.querySelectorAll('nav button');
    const views = document.querySelectorAll('.view');
    const fechaInput = document.getElementById('fecha-seleccionada');
    const listaTransaccionesEl = document.getElementById('lista-transacciones');
    const dailyExpenseAmountInput = document.getElementById('daily-expense-amount');
    const listaDeudoresEl = document.getElementById('lista-deudores');
    const debtToggleSwitch = document.getElementById('debt-toggle-switch');
    const listaInventarioEl = document.getElementById('lista-inventario');
    const btnNuevaVenta = document.getElementById('btn-nueva-venta');
    const modalContainer = document.getElementById('modal-container');
    const historyFilterBtns = document.querySelectorAll('.filter-btn');
    const historyMonthInput = document.getElementById('history-month-input');
    const historyDayInput = document.getElementById('history-day-input');
    
    // --- PLANTILLAS DE MODALES ---
    const modalTemplates = {
        nuevaVenta: `
            <div id="modal-nueva-transaccion" class="modal-overlay">
                <div class="modal-content">
                    <h3 id="sale-modal-title">Nueva Venta</h3>
                    <div class="sale-container">
                        <div class="product-list" id="modal-product-list"></div>
                        <div class="cart-container">
                            <div class="cart-items" id="modal-cart-items"><p>Selecciona productos...</p></div>
                            <div class="cart-summary">
                                <div class="cart-total" id="modal-cart-total">Total: $0</div>
                                <form id="form-nueva-transaccion">
                                    <input type="hidden" id="sale-id">
                                    <div class="form-group" style="margin-bottom: 0.5rem;">
                                        <select id="cliente-id" required>
                                            <option value="">Seleccione un comprador...</option>
                                        </select>
                                    </div>
                                    <div class="payment-options">
                                        <button type="button" class="payment-btn" data-method="efectivo">Efectivo</button>
                                        <button type="button" class="payment-btn" data-method="transferencia">Transferencia</button>
                                        <button type="button" class="payment-btn" data-method="credito">Crédito</button>
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" class="btn-cancelar btn-secondary">Cancelar</button>
                                        <button type="submit" class="btn-primary">Guardar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
        registrarPago: `
            <div id="modal-registrar-pago" class="modal-overlay">
                <div class="modal-content form-modal">
                    <h3 id="pago-titulo-cliente">Registrar Pago</h3>
                    <p>Deuda actual: <strong id="pago-deuda-actual"></strong></p>
                    <form id="form-registrar-pago">
                        <input type="hidden" id="pago-cliente-id">
                        <div class="form-group"><label for="pago-monto">Monto a Pagar ($)</label><input type="number" id="pago-monto" required></div>
                        <div class="form-actions">
                            <button type="button" class="btn-cancelar btn-secondary">Cancelar</button>
                            <button type="submit" class="btn-primary">Registrar Pago</button>
                        </div>
                    </form>
                </div>
            </div>`,
        producto: `
            <div id="modal-producto" class="modal-overlay">
                <div class="modal-content form-modal">
                    <h3 id="producto-modal-title">Gestionar Producto</h3>
                    <form id="form-producto">
                        <input type="hidden" id="producto-id">
                        <div class="form-group"><label for="producto-nombre">Nombre</label><input type="text" id="producto-nombre" required></div>
                        <div class="form-group"><label for="producto-precio">Precio ($)</label><input type="number" id="producto-precio" required></div>
                        <div class="form-actions">
                            <button type="button" class="btn-cancelar btn-secondary">Cancelar</button>
                            <button type="submit" class="btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>`,
        confirmarEliminacion: `
            <div id="modal-confirmar-eliminacion" class="modal-overlay">
                <div class="modal-content form-modal">
                    <h3>Confirmar Eliminación</h3>
                    <p>¿Está seguro de que desea eliminar esta venta? Esta acción no se puede deshacer.</p>
                    <div class="form-actions">
                        <button type="button" class="btn-cancelar btn-secondary">Cancelar</button>
                        <button type="button" id="btn-confirmar-eliminar" class="btn-danger">Eliminar</button>
                    </div>
                </div>
            </div>`
    };

    function openModal(modalName, setupCallback) {
        modalContainer.innerHTML = modalTemplates[modalName];
        if (setupCallback) setupCallback();
        modalContainer.querySelector('.modal-overlay').classList.remove('hidden');
        modalContainer.querySelector('.btn-cancelar').addEventListener('click', closeModal);
    }

    function closeModal() {
        modalContainer.innerHTML = '';
    }

    // --- LÓGICA DE LA APLICACIÓN ---
    function showToast(message, type = 'error') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        if (type === 'success') {
            toast.style.backgroundColor = 'var(--secondary-color)';
        }
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    function getTodayString() { return new Date().toISOString().split('T')[0]; }
    function formatCurrency(value) { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value); }

    // --- Lógica de Vistas ---
    function switchView(viewName) {
        navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
        views.forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
        btnNuevaVenta.classList.toggle('hidden', viewName !== 'ventas');
        
        switch(viewName) {
            case 'reportes': renderReportes(); break;
            case 'ventas': renderizarVentas(fechaInput.value); break;
            case 'deudas': renderizarDeudores(); break;
            case 'inventario': renderizarInventario(); break;
            case 'historial': renderizarHistorial(); break;
        }
    }

    // --- Lógica de Reportes (Antes Resumen) ---
    function renderReportes() {
        const now = new Date();
        const currentMonthStr = now.toISOString().slice(0, 7); // Formato "AAAA-MM"

        // --- Lógica para el tablero de totales del mes ---
        const monthlyTransactions = transacciones.filter(t => t.fecha.startsWith(currentMonthStr));
        const monthlyExpenses = gastos.filter(g => g.fecha.startsWith(currentMonthStr));
        
        const totalVentasMes = monthlyTransactions.reduce((sum, t) => sum + t.valor, 0);
        const totalContadoMes = monthlyTransactions.filter(t => t.metodo_pago !== 'credito').reduce((sum, t) => sum + t.valor, 0);
        const totalCreditoMes = monthlyTransactions.filter(t => t.metodo_pago === 'credito').reduce((sum, t) => sum + t.valor, 0);
        const totalGastosMes = monthlyExpenses.reduce((sum, g) => sum + g.monto, 0);
        const gananciaMes = totalVentasMes - totalGastosMes;

        document.getElementById('monthly-profit-amount').textContent = formatCurrency(gananciaMes);
        document.getElementById('monthly-total-amount').textContent = formatCurrency(totalVentasMes);
        document.getElementById('monthly-cash-amount').textContent = formatCurrency(totalContadoMes);
        document.getElementById('monthly-credit-amount').textContent = formatCurrency(totalCreditoMes);
        
        // --- Lógica para las tarjetas de resumen ---
        const productCounts = {};
        monthlyTransactions.forEach(t => {
            const items = t.descripcion.split(', ');
            items.forEach(itemString => {
                const match = itemString.match(/(.+) \(x(\d+)\)/);
                if (match) {
                    const [, nombre, cantidad] = match;
                    productCounts[nombre] = (productCounts[nombre] || 0) + parseInt(cantidad);
                }
            });
        });
        
        let bestProduct = '--';
        let maxCount = 0;
        for (const product in productCounts) {
            if (productCounts[product] > maxCount) {
                maxCount = productCounts[product];
                bestProduct = product;
            }
        }
        document.getElementById('summary-best-product').textContent = bestProduct;

        const balances = calcularBalances();
        const topDebtors = Object.values(balances)
            .filter(b => b.saldo > 0)
            .sort((a, b) => b.saldo - a.saldo)
            .slice(0, 3);
        
        const topDebtorsEl = document.getElementById('summary-top-debtors');
        topDebtorsEl.innerHTML = '';
        if (topDebtors.length > 0) {
            topDebtors.forEach(d => {
                topDebtorsEl.innerHTML += `<li><span>${d.cliente.nombre}</span> <strong>${formatCurrency(d.saldo)}</strong></li>`;
            });
        } else {
            topDebtorsEl.innerHTML = '<li>No hay deudas pendientes</li>';
        }

        const recentPayments = pagos.slice(-3).reverse();
        const recentPaymentsEl = document.getElementById('summary-recent-payments');
        recentPaymentsEl.innerHTML = '';
        if (recentPayments.length > 0) {
            recentPayments.forEach(p => {
                const cliente = clientes.find(c => c.id === p.cliente_id);
                recentPaymentsEl.innerHTML += `<li><span>${cliente.nombre}</span> <strong>${formatCurrency(p.monto)}</strong></li>`;
            });
        } else {
            recentPaymentsEl.innerHTML = '<li>No se han recibido pagos</li>';
        }
    }

    // --- Lógica de Ventas ---
    function renderizarVentas(fecha) {
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
        dailyExpenseAmountInput.value = montoGasto > 0 ? montoGasto : '';
        
        // Actualiza el resumen en el título de la tarjeta
        document.getElementById('daily-totals-summary').textContent = `Total: ${formatCurrency(totalDelDia)}`;
    }

    // --- Lógica de Deudas ---
    function calcularBalances() {
        const balances = {};
        clientes.forEach(c => {
            balances[c.id] = { cliente: c, totalDeuda: 0, totalPagado: 0, saldo: 0 };
        });
        transacciones.forEach(t => {
            if (t.metodo_pago === 'credito' && balances[t.cliente_id]) {
                balances[t.cliente_id].totalDeuda += t.valor;
            }
        });
        pagos.forEach(p => {
            if (balances[p.cliente_id]) {
                balances[p.cliente_id].totalPagado += p.monto;
            }
        });
        for (const id in balances) {
            balances[id].saldo = balances[id].totalDeuda - balances[id].totalPagado;
        }
        return balances;
    }

    function renderizarDeudores() {
        const showPaid = debtToggleSwitch.checked;
        listaDeudoresEl.innerHTML = '';
        const balances = calcularBalances();
        
        const deudores = Object.values(balances).filter(b => {
            if (showPaid) {
                return b.totalDeuda > 0 && b.saldo <= 0; // Tuvo deuda y está al día
            }
            return b.saldo > 0; // Tiene deuda pendiente
        });

        if (deudores.length === 0) {
            listaDeudoresEl.innerHTML = `<p>${showPaid ? 'No hay clientes al día.' : '¡Excelente! No hay deudas pendientes.'}</p>`;
            return;
        }

        deudores.forEach(({ cliente, totalDeuda, totalPagado, saldo }) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item debtor-item';
            itemEl.dataset.clienteId = cliente.id;
            itemEl.innerHTML = `
                <div class="details">
                    <p class="description">${cliente.nombre}</p>
                    <p class="meta">Deuda total: ${formatCurrency(totalDeuda)} | Pagado: ${formatCurrency(totalPagado)}</p>
                </div>
                <div class="item-actions">
                     <span class="amount ${saldo > 0 ? 'credit' : 'cash'}">${formatCurrency(saldo)}</span>
                     ${saldo > 0 ? `<button class="btn-pagar btn-primary" data-cliente-id="${cliente.id}" data-deuda-total="${saldo}">Abonar</button>` : ''}
                </div>`;
            listaDeudoresEl.appendChild(itemEl);
        });
    }

    // --- Lógica de Inventario ---
    function renderizarInventario() {
        listaInventarioEl.innerHTML = '';
        if (productos.length === 0) {
            listaInventarioEl.innerHTML = '<p>No hay productos en el inventario.</p>';
        } else {
            productos.forEach(p => {
                const itemEl = document.createElement('div');
                itemEl.className = 'item inventory-row';
                itemEl.innerHTML = `
                    <div class="details"><p class="description">${p.nombre}</p></div>
                    <div class="amount">${formatCurrency(p.precio)}</div>
                    <div class="item-actions">
                        <button class="btn-editar-producto btn-secondary" data-id="${p.id}">Editar</button>
                    </div>`;
                listaInventarioEl.appendChild(itemEl);
            });
        }
    }
    
    // --- Lógica de Historial ---
    function renderizarHistorial(filterType = 'all', filterValue = null) {
        const historyListEl = document.getElementById('lista-historial');
        const historyTotalEl = document.getElementById('history-total');
        historyListEl.innerHTML = '';
        
        let filteredTransactions = [...transacciones].sort((a, b) => b.id - a.id);

        if (filterType === 'day' && filterValue) {
            filteredTransactions = filteredTransactions.filter(t => t.fecha === filterValue);
        } else if (filterType === 'month' && filterValue) {
            filteredTransactions = filteredTransactions.filter(t => t.fecha.startsWith(filterValue));
        }

        let total = 0;
        if (filteredTransactions.length === 0) {
            historyListEl.innerHTML = '<p>No se encontraron ventas para este período.</p>';
        } else {
            filteredTransactions.forEach(t => {
                const cliente = clientes.find(c => c.id === t.cliente_id);
                const itemEl = document.createElement('div');
                itemEl.className = 'item';
                let amountClass = t.metodo_pago === 'credito' ? 'credit' : 'cash';
                
                itemEl.innerHTML = `
                    <div class="details">
                        <p class="description">${t.descripcion}</p>
                        <p class="meta">${t.fecha} - ${cliente ? cliente.nombre : 'N/A'} - ${t.metodo_pago}</p>
                    </div>
                    <div class="amount ${amountClass}">${formatCurrency(t.valor)}</div>`;
                historyListEl.appendChild(itemEl);
                total += t.valor;
            });
        }
        historyTotalEl.textContent = `Total del Período: ${formatCurrency(total)}`;
    }
    
    // --- Lógica de Modales y Formularios ---
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
        currentCart = [];

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
                    currentCart = currentCart.filter(item => item.id !== productId);
                }
                renderCart();
            }
        }

        function changeQuantity(productId, change) {
            const cartItem = currentCart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.cantidad += change;
                if (cartItem.cantidad <= 0) currentCart = currentCart.filter(item => item.id !== productId);
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

        // Setup
        modalTitle.textContent = isEditMode ? 'Editar Venta' : 'Nueva Venta';
        renderProductsInModal();
        selectCliente.innerHTML = '<option value="">Seleccione un comprador...</option>' + clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        
        if (isEditMode) {
            const tx = transacciones.find(t => t.id === transactionId);
            if (tx) {
                saleIdInput.value = tx.id;
                currentCart = parseDescriptionToCart(tx.descripcion);
                selectCliente.value = tx.cliente_id;
                paymentButtons.forEach(btn => {
                    btn.classList.toggle('selected', btn.dataset.method === tx.metodo_pago);
                });
                renderCart();
            }
        }

        // Event Listeners
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
                fecha: fechaInput.value,
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
            renderizarVentas(fechaInput.value);
            renderizarDeudores();
        });
    }

    function setupPagoModal(clienteId, deudaTotal) {
        const cliente = clientes.find(c => c.id == clienteId);
        document.getElementById('pago-cliente-id').value = clienteId;
        document.getElementById('pago-titulo-cliente').textContent = `Registrar Pago para ${cliente.nombre}`;
        document.getElementById('pago-deuda-actual').textContent = formatCurrency(deudaTotal);
        const montoInput = document.getElementById('pago-monto');
        montoInput.max = deudaTotal;
        montoInput.value = '';

        document.getElementById('form-registrar-pago').addEventListener('submit', e => {
            e.preventDefault();
            const monto = parseInt(montoInput.value);
            if (monto > 0) {
                pagos.push({ id: Date.now(), cliente_id: parseInt(clienteId), monto: monto, fecha: getTodayString() });
            }
            closeModal();
            renderizarDeudores();
        });
    }

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
        }

        form.addEventListener('submit', e => {
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

            if (id) { // Edit
                const index = productos.findIndex(p => p.id === id);
                if (index !== -1) productos[index] = updatedProduct;
            } else { // Add
                productos.push(updatedProduct);
            }
            closeModal();
            renderizarInventario();
        });
    }

    // --- EVENT LISTENERS GLOBALES ---
    navButtons.forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
    fechaInput.addEventListener('input', () => renderizarVentas(fechaInput.value));
    btnNuevaVenta.addEventListener('click', () => openModal('nuevaVenta', () => setupVentaModal()));
    
    listaTransaccionesEl.addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;

        const transactionId = parseInt(target.dataset.id);

        if (target.classList.contains('btn-editar-venta')) {
            openModal('nuevaVenta', () => setupVentaModal(transactionId));
        }
        if (target.classList.contains('btn-eliminar-venta')) {
            openModal('confirmarEliminacion', () => {
                document.getElementById('btn-confirmar-eliminar').onclick = () => {
                    transacciones = transacciones.filter(t => t.id !== transactionId);
                    closeModal();
                    renderizarVentas(fechaInput.value);
                    renderizarDeudores();
                };
            });
        }
    });

    document.getElementById('view-deudas').addEventListener('click', e => {
        const payButton = e.target.closest('.btn-pagar');
        if (payButton) {
            e.stopPropagation();
            const clienteId = payButton.dataset.clienteId;
            const deudaTotal = payButton.dataset.deudaTotal;
            openModal('registrarPago', () => setupPagoModal(clienteId, deudaTotal));
            return;
        }
        
        const debtorItem = e.target.closest('.debtor-item');
        if (debtorItem) {
            const clienteId = parseInt(debtorItem.dataset.clienteId);
            const existingDetails = debtorItem.querySelector('.debt-details');

            if (existingDetails) {
                existingDetails.remove();
            } else {
                const creditosPendientes = transacciones.filter(t => t.cliente_id === clienteId && t.estado_deuda === 'pendiente');
                if (creditosPendientes.length > 0) {
                    const detailsContainer = document.createElement('div');
                    detailsContainer.className = 'debt-details';
                    let detailsHTML = '<h4>Detalle de Créditos</h4>';
                    creditosPendientes.forEach(tx => {
                        detailsHTML += `<p><span>${tx.fecha}: ${tx.descripcion}</span> <strong>${formatCurrency(tx.valor)}</strong></p>`;
                    });
                    detailsContainer.innerHTML = detailsHTML;
                    debtorItem.appendChild(detailsContainer);
                }
            }
        }
    });
    
    debtToggleSwitch.addEventListener('change', renderizarDeudores);

    document.getElementById('view-inventario').addEventListener('click', e => {
        const target = e.target;
        if (target.id === 'btn-abrir-modal-producto') {
            openModal('producto', () => setupProductoModal());
        } else if (target.classList.contains('btn-editar-producto')) {
            const id = parseInt(target.dataset.id);
            const producto = productos.find(p => p.id === id);
            openModal('producto', () => setupProductoModal(producto));
        }
    });

    historyFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            historyFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            historyMonthInput.classList.toggle('hidden', filter !== 'month');
            historyDayInput.classList.toggle('hidden', filter !== 'day');
            
            if (filter === 'all') {
                renderizarHistorial('all');
            } else if (filter === 'month') {
                renderizarHistorial('month', historyMonthInput.value);
            } else if (filter === 'day') {
                renderizarHistorial('day', historyDayInput.value);
            }
        });
    });

    historyMonthInput.addEventListener('input', () => renderizarHistorial('month', historyMonthInput.value));
    historyDayInput.addEventListener('input', () => renderizarHistorial('day', historyDayInput.value));

    dailyExpenseAmountInput.addEventListener('input', (e) => {
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
    });

    // --- INICIALIZACIÓN ---
    function init() {
        const today = new Date();
        fechaInput.value = today.toISOString().split('T')[0];
        historyDayInput.value = today.toISOString().split('T')[0];
        historyMonthInput.value = today.toISOString().slice(0, 7);
        // CAMBIO: Iniciar en la vista de ventas
        switchView('ventas');
    }

    init();
});