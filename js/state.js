export let productos = [
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

export let clientes = [
    { id: 1, nombre: 'Ana García' },
    { id: 2, nombre: 'Carlos Ruiz' },
    { id: 3, nombre: 'Luisa Fernanda' },
    { id: 4, nombre: 'David Vélez' },
    { id: 5, nombre: 'James Rodríguez' },
];

export let transacciones = [
    {id: 1720401878356, fecha: "2025-07-07", descripcion: "Empanadas (x1)", valor: 2500, metodo_pago: "efectivo", cliente_id: 5, estado_deuda: "pagada"},
    {id: 1720401893043, fecha: "2025-07-07", descripcion: "Papas rellenas (x2), Gaseosa 7onz (x1)", valor: 8500, metodo_pago: "credito", cliente_id: 2, estado_deuda: "pendiente"},
    {id: 1720401905831, fecha: "2025-07-06", descripcion: "Café con leche (x1), Pasteles de pollo (x1)", valor: 6000, metodo_pago: "credito", cliente_id: 1, estado_deuda: "pendiente"}
];
export let pagos = [
    {id: 1720401920275, cliente_id: 1, monto: 2000, fecha: "2025-07-07"}
];

export let gastos = [
    {fecha: "2025-07-07", monto: 30000, nota: "Insumos para empanadas"}
];

// Re-exportamos la función para modificar las transacciones, ya que los imports son de solo lectura.
export function setTransacciones(newTransacciones) {
    transacciones = newTransacciones;
}

export let currentCart = [];
export function setCurrentCart(newCart) {
    currentCart = newCart;
}