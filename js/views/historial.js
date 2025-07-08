import { transacciones, clientes } from '../state.js';
import { formatCurrency } from '../utils.js';

function renderHistorial(filterType = 'all', filterValue = null) {
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

export function initHistorialView() {
    const historyFilterBtns = document.querySelectorAll('.filter-btn');
    const historyMonthInput = document.getElementById('history-month-input');
    const historyDayInput = document.getElementById('history-day-input');

    const renderBasedOnFilter = () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        const filter = activeBtn.dataset.filter;
        if (filter === 'all') {
            renderHistorial('all');
        } else if (filter === 'month') {
            renderHistorial('month', historyMonthInput.value);
        } else if (filter === 'day') {
            renderHistorial('day', historyDayInput.value);
        }
    }
    
    historyFilterBtns.forEach(btn => {
        btn.onclick = () => {
            historyFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            historyMonthInput.classList.toggle('hidden', filter !== 'month');
            historyDayInput.classList.toggle('hidden', filter !== 'day');
            renderBasedOnFilter();
        };
    });

    historyMonthInput.oninput = renderBasedOnFilter;
    historyDayInput.oninput = renderBasedOnFilter;
    
    renderHistorial('all'); // Render inicial
}