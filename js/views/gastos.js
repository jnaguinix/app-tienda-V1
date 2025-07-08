import { gastos } from '../state.js';
import { formatCurrency, showToast, openModal, closeModal, getTodayString } from '../utils.js';

const ITEMS_PER_PAGE = 20;
let currentPage = 0;
let allFilteredGastos = [];
let isLoadingMore = false;
let hasMoreItems = true;

function renderGastos(append = false) {
    const listaGastosEl = document.getElementById('lista-gastos');
    const loadingIndicator = document.getElementById('gastos-loading-indicator');

    if (!append) {
        listaGastosEl.innerHTML = '';
        currentPage = 0;
        hasMoreItems = true;

        const gastosOrdenados = [...gastos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const activeFilterBtn = document.querySelector('#view-gastos .filter-btn.active');
        const filterType = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
        const monthInput = document.getElementById('gastos-month-input');
        const dayInput = document.getElementById('gastos-day-input');

        if (filterType === 'day' && dayInput.value) {
            allFilteredGastos = gastosOrdenados.filter(g => g.fecha === dayInput.value);
        } else if (filterType === 'month' && monthInput.value) {
            allFilteredGastos = gastosOrdenados.filter(g => g.fecha.startsWith(monthInput.value));
        } else {
            allFilteredGastos = gastosOrdenados;
        }
    }

    loadingIndicator.style.display = 'block';

    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const gastosToRender = allFilteredGastos.slice(startIndex, endIndex);

    if (gastosToRender.length === 0 && !append) {
        listaGastosEl.innerHTML = '<p>No hay gastos para este período.</p>';
    } else {
        gastosToRender.forEach(g => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item inventory-row';
            itemEl.innerHTML = `
                <div class="details" style="flex: 2;">
                    <p class="description">${g.fecha}</p>
                    <p class="meta">${g.lugar}</p>
                </div>
                <div class="details" style="flex: 3;">${g.concepto}</div>
                <div class="amount" style="flex: 1;">${formatCurrency(g.monto)}</div>
                <div class="item-actions" style="flex: 0.5;">
                    <button class="btn-editar-gasto" data-id="${g.id}">✏️</button>
                </div>`;
            listaGastosEl.appendChild(itemEl);
        });
    }

    if (endIndex >= allFilteredGastos.length) {
        hasMoreItems = false;
    }

    currentPage++;
    loadingIndicator.style.display = 'none';
    isLoadingMore = false;
}

function setupGastoModal(gasto = null) {
    const form = document.getElementById('form-gasto');
    const title = document.getElementById('gasto-modal-title');
    const idInput = document.getElementById('gasto-id');
    const fechaInput = document.getElementById('gasto-fecha');
    const lugarInput = document.getElementById('gasto-lugar');
    const itemsContainer = document.getElementById('gasto-items-container');
    const btnAddGastoItem = document.getElementById('btn-add-gasto-item');
    const btnEliminarGastoModal = document.getElementById('btn-eliminar-gasto-modal');

    function addGastoItemRow(concept = '', amount = '') {
        const row = document.createElement('div');
        row.className = 'gasto-item-row';
        row.innerHTML = `
            <div class="form-group" style="flex: 3;">
                <label>Concepto</label>
                <textarea class="gasto-concepto-input" rows="1" placeholder="Ej: Verduras, Huevos" required>${concept}</textarea>
            </div>
            <div class="form-group" style="flex: 1;">
                <label>Monto ($)</label>
                <input type="number" class="gasto-monto-input" value="${amount}" required>
            </div>
            <button type="button" class="remove-item-btn">✖️</button>
        `;
        itemsContainer.appendChild(row);

        const textarea = row.querySelector('.gasto-concepto-input');
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        });
        if (concept) {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }

        row.querySelector('.remove-item-btn').onclick = () => {
            if (itemsContainer.children.length > 1) {
                row.remove();
            } else if (gasto) {
                 showToast('No puedes eliminar el único ítem de un gasto existente. Usa el botón "Eliminar" para borrar el gasto completo.');
            } else {
                showToast('Debe haber al menos un ítem.');
            }
        };
    }

    if (gasto) {
        title.textContent = 'Editar Gasto';
        idInput.value = gasto.id;
        fechaInput.value = gasto.fecha;
        lugarInput.value = gasto.lugar;
        btnEliminarGastoModal.classList.remove('hidden');
        btnAddGastoItem.classList.add('hidden');
        addGastoItemRow(gasto.concepto, gasto.monto);
    } else {
        title.textContent = 'Añadir Nuevo Gasto';
        fechaInput.value = getTodayString();
        form.reset();
        fechaInput.value = getTodayString();
        btnEliminarGastoModal.classList.add('hidden');
        btnAddGastoItem.classList.remove('hidden');
        addGastoItemRow();
    }

    btnAddGastoItem.onclick = () => addGastoItemRow();

    btnEliminarGastoModal.onclick = () => {
        openModal('confirmarEliminacion', () => {
            document.getElementById('btn-confirmar-eliminar').onclick = () => {
                const idToDelete = parseInt(idInput.value);
                const index = gastos.findIndex(g => g.id === idToDelete);
                if (index > -1) {
                    gastos.splice(index, 1);
                }
                closeModal();
                closeModal();
                renderGastos();
            };
        });
    };

    form.onsubmit = (e) => {
        e.preventDefault();

        const fecha = fechaInput.value;
        const lugar = lugarInput.value.trim();
        const conceptoInputs = Array.from(itemsContainer.querySelectorAll('.gasto-concepto-input'));
        const montoInputs = Array.from(itemsContainer.querySelectorAll('.gasto-monto-input'));

        let errors = [];
        if (!fecha || !lugar) {
            errors.push('La fecha y el lugar son obligatorios.');
        }

        const itemsToSave = [];
        for (let i = 0; i < conceptoInputs.length; i++) {
            const concepto = conceptoInputs[i].value.trim();
            const monto = parseInt(montoInputs[i].value);

            if (!concepto || isNaN(monto) || monto <= 0) {
                errors.push(`El ítem ${i + 1} tiene un concepto o monto inválido.`);
            } else {
                itemsToSave.push({ concepto, monto });
            }
        }

        if (itemsToSave.length === 0 && !gasto) {
            errors.push('Debe añadir al menos un ítem de gasto.');
        }

        if (errors.length > 0) {
            showToast(errors.join(' '));
            return;
        }

        if (gasto) {
            const updatedGasto = {
                id: parseInt(idInput.value),
                fecha: fecha,
                lugar: lugar,
                concepto: itemsToSave[0].concepto,
                monto: itemsToSave[0].monto
            };
            const index = gastos.findIndex(g => g.id === updatedGasto.id);
            if (index !== -1) gastos[index] = updatedGasto;
        } else {
            // CAMBIO: Se usa unshift en lugar de push para añadir al principio
            const nuevosGastos = itemsToSave.map(item => ({
                id: Date.now() + Math.floor(Math.random() * 1000),
                fecha: fecha,
                lugar: lugar,
                concepto: item.concepto,
                monto: item.monto
            })).reverse(); // Se revierte para que el primer item añadido en el modal quede primero en la lista

            gastos.unshift(...nuevosGastos);
        }
        
        closeModal();
        renderGastos();
    };
}

function handleScroll() {
    const listContainer = document.getElementById('lista-gastos');
    if (!listContainer) return;

    const scrollThreshold = 100;
    if (listContainer.scrollTop + listContainer.clientHeight >= listContainer.scrollHeight - scrollThreshold && hasMoreItems && !isLoadingMore) {
        isLoadingMore = true;
        renderGastos(true);
    }
}

export function initGastosView() {
    const listContainer = document.getElementById('lista-gastos');
    const filterBtns = document.querySelectorAll('#view-gastos .filter-btn');
    const monthInput = document.getElementById('gastos-month-input');
    const dayInput = document.getElementById('gastos-day-input');

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    monthInput.value = `${year}-${month}`;
    dayInput.value = today.toISOString().split('T')[0];

    document.getElementById('btn-abrir-modal-gasto').onclick = () => {
        openModal('gasto', () => setupGastoModal());
    };

    listContainer.onclick = (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = parseInt(target.dataset.id);

        if (target.classList.contains('btn-editar-gasto')) {
            const gasto = gastos.find(g => g.id === id);
            openModal('gasto', () => setupGastoModal(gasto));
        }
    };

    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            monthInput.classList.toggle('hidden', btn.dataset.filter !== 'month');
            dayInput.classList.toggle('hidden', btn.dataset.filter !== 'day');
            renderGastos();
        };
    });
    monthInput.oninput = () => renderGastos();
    dayInput.oninput = () => renderGastos();

    listContainer.removeEventListener('scroll', handleScroll);
    listContainer.addEventListener('scroll', handleScroll);

    renderGastos();
}