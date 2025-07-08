import { initVentasView, setupVentaModal } from './views/ventas.js'; // CAMBIO: Importar setupVentaModal
import { initGastosView } from './views/gastos.js';
import { initDeudasView } from './views/deudas.js';
import { initReportesView } from './views/reportes.js';
import { initInventarioView } from './views/inventario.js';
import { initHistorialView } from './views/historial.js';
import { openModal } from './utils.js';

const navButtons = document.querySelectorAll('nav button');
const views = document.querySelectorAll('.view');
const btnNuevaVenta = document.getElementById('btn-nueva-venta');

function switchView(viewName) {
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    views.forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
    btnNuevaVenta.classList.toggle('hidden', viewName !== 'ventas');
    
    switch(viewName) {
        case 'ventas': 
            initVentasView();
            break;
        case 'gastos':
            initGastosView();
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

function init() {
    const fechaInput = document.getElementById('fecha-seleccionada');
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => switchView(button.dataset.view));
    });

    // CAMBIO: El listener del botón FAB (+) ahora llama a setupVentaModal
    if (btnNuevaVenta) {
        btnNuevaVenta.onclick = () => {
            openModal('nuevaVenta', () => setupVentaModal());
        };
    }

    switchView('ventas');
}

document.addEventListener('DOMContentLoaded', init);