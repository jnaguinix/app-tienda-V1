import { initVentasView } from './views/ventas.js';
import { initDeudasView } from './views/deudas.js';
import { initReportesView } from './views/reportes.js';
import { initInventarioView } from './views/inventario.js';
import { initHistorialView } from './views/historial.js';

// --- ELEMENTOS PRINCIPALES DEL DOM ---
const navButtons = document.querySelectorAll('nav button');
const views = document.querySelectorAll('.view');
const btnNuevaVenta = document.getElementById('btn-nueva-venta');

// --- NAVEGACIÓN ---
function switchView(viewName) {
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    views.forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
    btnNuevaVenta.classList.toggle('hidden', viewName !== 'ventas');
    
    // Llama a la función de inicialización de la vista correspondiente
    switch(viewName) {
        case 'ventas': 
            initVentasView();
            break;
        case 'deudas': 
            initDeudasView();
            break;
        case 'reportes': 
            initReportesView();
            break;
        case 'inventario': 
            initInventarioView();
            break;
        case 'historial': 
            initHistorialView();
            break;
    }
}

// --- INICIALIZACIÓN DE LA APP ---
function init() {
    const fechaInput = document.getElementById('fecha-seleccionada');
    const historyDayInput = document.getElementById('history-day-input');
    const historyMonthInput = document.getElementById('history-month-input');
    
    const today = new Date();
    fechaInput.value = today.toISOString().split('T')[0];
    historyDayInput.value = today.toISOString().split('T')[0];
    historyMonthInput.value = today.toISOString().slice(0, 7);
    
    // Asignar listeners de navegación
    navButtons.forEach(button => {
        button.addEventListener('click', () => switchView(button.dataset.view));
    });

    // Iniciar en la vista de ventas
    switchView('ventas');
}

// Arrancar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);