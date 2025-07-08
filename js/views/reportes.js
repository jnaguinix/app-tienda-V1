import { transacciones, gastos, productos, pagos, clientes } from '../state.js';
import { formatCurrency } from '../utils.js';

let paymentChart = null; // Variable para mantener la instancia del gráfico

function renderMainReportTotals(filteredTransactions, filteredExpenses) {
    const totalVentas = filteredTransactions.reduce((sum, t) => sum + t.valor, 0);
    const totalGastos = filteredExpenses.reduce((sum, g) => sum + g.monto, 0);
    const ganancia = totalVentas - totalGastos;
    const totalEfectivo = filteredTransactions.filter(t => t.metodo_pago === 'efectivo').reduce((sum, t) => sum + t.valor, 0);
    const totalTransferencia = filteredTransactions.filter(t => t.metodo_pago === 'transferencia').reduce((sum, t) => sum + t.valor, 0);
    const totalCredito = filteredTransactions.filter(t => t.metodo_pago === 'credito').reduce((sum, t) => sum + t.valor, 0);

    document.getElementById('report-profit-amount').textContent = formatCurrency(ganancia);
    document.getElementById('report-sales-amount').textContent = formatCurrency(totalVentas);
    document.getElementById('report-expenses-amount').textContent = formatCurrency(totalGastos);
    document.getElementById('report-cash-amount').textContent = formatCurrency(totalEfectivo);
    document.getElementById('report-transfer-amount').textContent = formatCurrency(totalTransferencia);
    document.getElementById('report-credit-amount').textContent = formatCurrency(totalCredito);
}

function renderBestSellingProducts(transactionsInPeriod) {
    const productCounts = {};
    const productValues = {}; 

    transactionsInPeriod.forEach(t => {
        if (t.items_detalle && t.items_detalle.length > 0) {
            t.items_detalle.forEach(item => {
                productCounts[item.nombre] = (productCounts[item.nombre] || 0) + item.cantidad;
                productValues[item.nombre] = (productValues[item.nombre] || 0) + (item.cantidad * item.precio_unitario);
            });
        }
    });

    const sortedProducts = Object.keys(productCounts)
        .map(name => ({
            name: name,
            units: productCounts[name],
            value: productValues[name]
        }))
        .sort((a, b) => b.units - a.units || b.value - a.value)
        .slice(0, 5);

    const listEl = document.getElementById('report-best-products-list');
    listEl.innerHTML = '';

    if (sortedProducts.length === 0) {
        listEl.innerHTML = '<li>No hay ventas en este período.</li>';
    } else {
        sortedProducts.forEach(p => {
            listEl.innerHTML += `<li><span>${p.name}</span> <strong>${p.units} uds. (${formatCurrency(p.value)})</strong></li>`;
        });
    }
}

function renderPaymentDistribution(transactionsInPeriod) {
    const ctx = document.getElementById('payment-distribution-chart');
    if (!ctx) return;

    if (paymentChart) {
        paymentChart.destroy();
    }

    const totalEfectivo = transactionsInPeriod.filter(t => t.metodo_pago === 'efectivo').reduce((sum, t) => sum + t.valor, 0);
    const totalTransferencia = transactionsInPeriod.filter(t => t.metodo_pago === 'transferencia').reduce((sum, t) => sum + t.valor, 0);
    const totalCredito = transactionsInPeriod.filter(t => t.metodo_pago === 'credito').reduce((sum, t) => sum + t.valor, 0);

    const data = {
        labels: ['Efectivo', 'Transferencia', 'Crédito'],
        datasets: [{
            label: 'Distribución de Pagos',
            data: [totalEfectivo, totalTransferencia, totalCredito],
            backgroundColor: [
                '#2ecc71',
                '#f1c40f',
                '#e74c3c'
            ],
            hoverOffset: 4
        }]
    };

    if (totalEfectivo === 0 && totalTransferencia === 0 && totalCredito === 0) {
        ctx.style.display = 'none';
        return;
    }
    
    ctx.style.display = 'block';

    paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function renderRecentPayments() {
    const recentPayments = pagos.slice(-3).reverse();
    const recentPaymentsEl = document.getElementById('report-recent-payments-list');
    recentPaymentsEl.innerHTML = '';

    if (recentPayments.length > 0) {
        recentPayments.forEach(p => {
            const cliente = clientes.find(c => c.id === p.cliente_id);
            recentPaymentsEl.innerHTML += `<li><span>${cliente.nombre}</span> <strong>${formatCurrency(p.monto)}</strong></li>`;
        });
    } else {
        recentPaymentsEl.innerHTML = '<li>No se han recibido pagos.</li>';
    }
}


export function initReportesView() {
    const filterTypeSelect = document.getElementById('report-filter-type');
    const monthInput = document.getElementById('report-month-input');
    const rangeInputsContainer = document.getElementById('report-range-inputs');
    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');

    function updateReport() {
        const filterType = filterTypeSelect.value;
        let startDate, endDate;

        if (filterType === 'month') {
            if (!monthInput.value) {
                clearReportSections();
                return;
            }
            const [year, month] = monthInput.value.split('-');
            startDate = `${year}-${month}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        } else {
            startDate = startDateInput.value;
            endDate = endDateInput.value;
        }
        
        if (startDate && endDate && startDate <= endDate) {
            const filteredTransactions = transacciones.filter(t => t.fecha >= startDate && t.fecha <= endDate);
            const filteredExpenses = gastos.filter(g => g.fecha >= startDate && g.fecha <= endDate);

            renderMainReportTotals(filteredTransactions, filteredExpenses);
            renderBestSellingProducts(filteredTransactions);
            renderPaymentDistribution(filteredTransactions);
            renderRecentPayments();
        } else {
            clearReportSections();
        }
    }

    function clearReportSections() {
        document.getElementById('report-profit-amount').textContent = formatCurrency(0);
        document.getElementById('report-sales-amount').textContent = formatCurrency(0);
        document.getElementById('report-expenses-amount').textContent = formatCurrency(0);
        document.getElementById('report-cash-amount').textContent = formatCurrency(0);
        document.getElementById('report-transfer-amount').textContent = formatCurrency(0);
        document.getElementById('report-credit-amount').textContent = formatCurrency(0);
        document.getElementById('report-best-products-list').innerHTML = '<li>No hay ventas en este período.</li>';
        
        if (paymentChart) {
            paymentChart.destroy();
            paymentChart = null;
        }
        const ctx = document.getElementById('payment-distribution-chart');
        if (ctx) ctx.style.display = 'none';

        document.getElementById('report-recent-payments-list').innerHTML = '<li>No se han recibido pagos.</li>';
    }
    
    filterTypeSelect.onchange = () => {
        const isMonth = filterTypeSelect.value === 'month';
        monthInput.classList.toggle('hidden', !isMonth);
        rangeInputsContainer.classList.toggle('hidden', isMonth);
        updateReport();
    };

    monthInput.onchange = updateReport;
    startDateInput.onchange = updateReport;
    endDateInput.onchange = updateReport;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    monthInput.value = `${year}-${month}`;
    startDateInput.value = `${year}-${month}-01`;
    endDateInput.value = `${year}-${month}-${day}`;

    updateReport();
}