import { transacciones, gastos, clientes, pagos } from '../state.js';
import { formatCurrency, calcularBalances } from '../utils.js';

export function initReportesView() {
    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);

    const monthlyTransactions = transacciones.filter(t => t.fecha.startsWith(currentMonthStr));
    const monthlyExpenses = gastos.filter(g => g.fecha.startsWith(currentMonthStr));
    
    const totalVentasMes = monthlyTransactions.reduce((sum, t) => sum + t.valor, 0);
    const totalContadoMes = monthlyTransactions.filter(t => t.metodo_pago !== 'credito').reduce((sum, t) => sum + t.valor, 0);
    const totalCreditoMes = totalVentasMes - totalContadoMes;
    const totalGastosMes = monthlyExpenses.reduce((sum, g) => sum + g.monto, 0);
    const gananciaMes = totalVentasMes - totalGastosMes;

    document.getElementById('monthly-profit-amount').textContent = formatCurrency(gananciaMes);
    document.getElementById('monthly-total-amount').textContent = formatCurrency(totalVentasMes);
    document.getElementById('monthly-cash-amount').textContent = formatCurrency(totalContadoMes);
    document.getElementById('monthly-credit-amount').textContent = formatCurrency(totalCreditoMes);
    
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

    const balances = calcularBalances(clientes, transacciones, pagos);
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