// --- FUNCIONES DE UTILIDAD GENERAL ---
export function showToast(message, type = 'error') {
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

export function getTodayString() { 
    return new Date().toISOString().split('T')[0]; 
}

export function formatCurrency(value) { 
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value); 
}

// --- LÓGICA DE CÁLCULO ---
export function calcularBalances(clientes, transacciones, pagos) {
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


// --- LÓGICA DE MODALES ---
export const modalTemplates = {
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

export function openModal(modalName, setupCallback) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = modalTemplates[modalName];
    if (setupCallback) setupCallback();
    modalContainer.querySelector('.modal-overlay').classList.remove('hidden');
    modalContainer.querySelector('.btn-cancelar').addEventListener('click', closeModal);
}

export function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
}