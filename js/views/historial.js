import { transacciones, pagos, clientes } from '../state.js';
import { formatCurrency } from '../utils.js';

const ITEMS_PER_PAGE = 20; // Cuántos elementos cargar por vez
let currentPage = 0; // Página actual de resultados
let allHistoryRecords = []; // Todos los registros combinados y ordenados
let isLoadingMore = false; // Bandera para evitar cargas múltiples
let hasMoreItems = true; // Indica si hay más elementos para cargar

function combineAndSortHistory() {
    const combined = [];

    // Añadir transacciones
    transacciones.forEach(t => {
        combined.push({
            type: 'venta',
            id: t.id,
            fecha: t.fecha,
            descripcion: t.descripcion,
            valor: t.valor,
            metodo_pago: t.metodo_pago,
            cliente_id: t.cliente_id
        });
    });

    // Añadir pagos
    pagos.forEach(p => {
        combined.push({
            type: 'pago',
            id: p.id,
            fecha: p.fecha,
            monto: p.monto,
            cliente_id: p.cliente_id
        });
    });

    // Ordenar por fecha (más reciente primero), y luego por ID (timestamp) para consistencia
    combined.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        if (dateB.getTime() !== dateA.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }
        return b.id - a.id; // Para un orden consistente si las fechas son iguales
    });

    allHistoryRecords = combined;
}


function renderHistorial(append = false) {
    const historyListEl = document.getElementById('lista-historial');
    const historyTotalEl = document.getElementById('history-total');
    const loadingIndicator = document.getElementById('history-loading-indicator');

    if (!append) {
        historyListEl.innerHTML = '';
        currentPage = 0;
        combineAndSortHistory(); // Re-combinar y ordenar todos los registros
        hasMoreItems = true; // Resetear para una nueva búsqueda
    }

    loadingIndicator.style.display = 'block'; // Mostrar cargando antes de procesar

    // Aplicar filtros (si no es 'all')
    const activeFilterBtn = document.querySelector('#view-historial .filter-btn.active');
    const filterType = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    const historyMonthInput = document.getElementById('history-month-input');
    const historyDayInput = document.getElementById('history-day-input');

    let filteredRecords = allHistoryRecords;
    let filterValue = null;

    if (filterType === 'day' && historyDayInput.value) {
        filterValue = historyDayInput.value;
        filteredRecords = allHistoryRecords.filter(record => record.fecha === filterValue);
    } else if (filterType === 'month' && historyMonthInput.value) {
        filterValue = historyMonthInput.value;
        filteredRecords = allHistoryRecords.filter(record => record.fecha.startsWith(filterValue));
    }

    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const recordsToRender = filteredRecords.slice(startIndex, endIndex);

    let total = 0; // Total de ventas (ingresos) para el período filtrado

    if (recordsToRender.length === 0 && !append) {
        historyListEl.innerHTML = '<p>No se encontraron registros para este período.</p>';
        hasMoreItems = false;
    } else {
        recordsToRender.forEach(record => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item';
            
            if (record.type === 'venta') {
                const cliente = clientes.find(c => c.id === record.cliente_id);
                let amountClass = record.metodo_pago === 'credito' ? 'credit' : 'cash';
                itemEl.innerHTML = `
                    <div class="details">
                        <p class="description">${record.descripcion}</p>
                        <p class="meta">${record.fecha} - ${cliente ? cliente.nombre : 'N/A'} - ${record.metodo_pago}</p>
                    </div>
                    <div class="amount ${amountClass}">${formatCurrency(record.valor)}</div>`;
                total += record.valor; // Sumar ventas al total
            } else if (record.type === 'pago') {
                const cliente = clientes.find(c => c.id === record.cliente_id);
                itemEl.innerHTML = `
                    <div class="details" style="font-weight: bold; color: var(--secondary-color);">
                        <p class="description">Abono de Deuda de ${cliente ? cliente.nombre : 'N/A'}</p>
                        <p class="meta">${record.fecha}</p>
                    </div>
                    <div class="amount cash">${formatCurrency(record.monto)}</div>`;
                total += record.monto; // Sumar pagos al total
            }
            historyListEl.appendChild(itemEl);
        });

        if (recordsToRender.length < ITEMS_PER_PAGE || endIndex >= filteredRecords.length) {
            hasMoreItems = false;
        } else {
            currentPage++;
        }
    }
    historyTotalEl.textContent = `Total del Período: ${formatCurrency(total)}`;
    loadingIndicator.style.display = 'none'; // Ocultar cargando
    isLoadingMore = false; // Permitir nuevas cargas
}

// Función para manejar el scroll y cargar más elementos
function handleScroll() {
    const listContainer = document.getElementById('lista-historial');
    if (!listContainer) return;

    // Detectar si el usuario está cerca del final del scroll
    const scrollThreshold = 100; // Cargar cuando queden 100px para el final
    if (listContainer.scrollTop + listContainer.clientHeight >= listContainer.scrollHeight - scrollThreshold && hasMoreItems && !isLoadingMore) {
        isLoadingMore = true; // Activar bandera
        renderHistorial(true); // Cargar más elementos
    }
}

export function initHistorialView() {
    const historyFilterBtns = document.querySelectorAll('#view-historial .filter-btn');
    const historyMonthInput = document.getElementById('history-month-input');
    const historyDayInput = document.getElementById('history-day-input');
    const listContainer = document.getElementById('lista-historial');

    // Inicialización de los valores de fecha
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    historyMonthInput.value = `${year}-${month}`;
    historyDayInput.value = today.toISOString().split('T')[0];

    // Limpiar listener anterior para evitar duplicados al cambiar de vista
    listContainer.removeEventListener('scroll', handleScroll);
    // Añadir listener de scroll para cargar más elementos
    listContainer.addEventListener('scroll', handleScroll);

    // Re-renderizar cuando cambie el filtro
    historyFilterBtns.forEach(btn => {
        btn.onclick = () => {
            historyFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            historyMonthInput.classList.toggle('hidden', btn.dataset.filter !== 'month');
            historyDayInput.classList.toggle('hidden', btn.dataset.filter !== 'day');
            renderHistorial(); // Reinicia la paginación y renderiza
        };
    });

    historyMonthInput.oninput = () => renderHistorial();
    historyDayInput.oninput = () => renderHistorial();
    
    renderHistorial(); // Render inicial al entrar a la vista
}