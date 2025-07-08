import { clientes, transacciones, pagos } from '../state.js';
import { formatCurrency, openModal, closeModal, getTodayString, calcularBalances } from '../utils.js';

function setupPagoModal(clienteId, deudaTotal) {
    const cliente = clientes.find(c => c.id == clienteId);
    document.getElementById('pago-cliente-id').value = clienteId;
    document.getElementById('pago-titulo-cliente').textContent = `Registrar Pago para ${cliente.nombre}`;
    document.getElementById('pago-deuda-actual').textContent = formatCurrency(deudaTotal);
    const montoInput = document.getElementById('pago-monto');
    montoInput.max = deudaTotal;
    montoInput.value = '';

    document.getElementById('form-registrar-pago').onsubmit = (e) => {
        e.preventDefault();
        const monto = parseInt(montoInput.value);
        if (monto > 0) {
            pagos.push({ id: Date.now(), cliente_id: parseInt(clienteId), monto: monto, fecha: getTodayString() });
        }
        closeModal();
        initDeudasView();
    };
}

export function initDeudasView() {
    const listaDeudoresEl = document.getElementById('lista-deudores');
    const debtToggleSwitch = document.getElementById('debt-toggle-switch');
    const showPaid = debtToggleSwitch.checked;
    
    listaDeudoresEl.innerHTML = '';
    const balances = calcularBalances(clientes, transacciones, pagos);
    
    const deudores = Object.values(balances).filter(b => {
        if (showPaid) {
            return b.totalDeuda > 0 && b.saldo <= 0;
        }
        return b.saldo > 0;
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

    debtToggleSwitch.onchange = initDeudasView;

    listaDeudoresEl.onclick = (e) => {
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
                const creditosPendientes = transacciones.filter(t => t.cliente_id === clienteId && t.metodo_pago === 'credito' && t.estado_deuda === 'pendiente');
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
    };
}