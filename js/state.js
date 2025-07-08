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

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

export let transacciones = [
    {
        id: Date.now() + 1,
        fecha: today,
        descripcion: "Empanadas (x2), Tinto (x1)",
        valor: 6300,
        metodo_pago: "efectivo",
        cliente_id: 1,
        estado_deuda: "pagada",
        items_detalle: [
            { nombre: 'Empanadas', cantidad: 2, precio_unitario: 2500 },
            { nombre: 'Tinto', cantidad: 1, precio_unitario: 1300 }
        ]
    },
    {
        id: Date.now() + 2,
        fecha: today,
        descripcion: "Papas rellenas (x1), Gaseosa 7onz (x1)",
        valor: 5000,
        metodo_pago: "credito",
        cliente_id: 2,
        estado_deuda: "pendiente",
        items_detalle: [
            { nombre: 'Papas rellenas', cantidad: 1, precio_unitario: 3500 },
            { nombre: 'Gaseosa 7onz', cantidad: 1, precio_unitario: 1500 }
        ]
    },
    {
        id: 1720401905831,
        fecha: yesterday,
        descripcion: "Café con leche (x1), Pasteles de pollo (x1)",
        valor: 6000,
        metodo_pago: "credito",
        cliente_id: 1,
        estado_deuda: "pendiente",
        items_detalle: [
            { nombre: 'Café con leche', cantidad: 1, precio_unitario: 2500 },
            { nombre: 'Pasteles de pollo', cantidad: 1, precio_unitario: 3500 }
        ]
    },
];

export let pagos = [
    {id: 1720401920275, cliente_id: 1, monto: 2000, fecha: yesterday}
];

export let gastos = [
    {id: 1, fecha: yesterday, lugar: "Supermercado La 80", concepto: "Insumos para empanadas, gaseosas", monto: 45000},
    {id: 2, fecha: today, lugar: "Carnicería El Buen Sabor", concepto: "Carne para relleno", monto: 30000},
    {id: 3, fecha: today, lugar: "Plaza de mercado", concepto: "Verduras frescas", monto: 18000},
    {id: 4, fecha: today, lugar: "Panadería El Trigal", concepto: "Pan para el evento", monto: 12000},
    {id: 5, fecha: yesterday, lugar: "Droguería Pasteur", concepto: "Jabón, guantes, desinfectante", monto: 15500},
    {id: 6, fecha: today, lugar: "Tienda Don Luis", concepto: "Bolsas plásticas, servilletas", monto: 8200},
    {id: 7, fecha: yesterday, lugar: "Supermercado La 80", concepto: "Snacks y gaseosas", monto: 26500},
    {id: 8, fecha: today, lugar: "Papelería Mundo Color", concepto: "Cartulinas y marcadores", monto: 9700},
    {id: 9, fecha: yesterday, lugar: "Ferretería Central", concepto: "Cinta adhesiva y tornillos", monto: 10800},
    {id: 10, fecha: today, lugar: "Frutería Las Delicias", concepto: "Frutas variadas", monto: 13400},
    {id: 11, fecha: yesterday, lugar: "Tienda Don Luis", concepto: "Azúcar y sal", monto: 6500},
    {id: 12, fecha: today, lugar: "Droguería Pasteur", concepto: "Alcohol y algodón", monto: 10300},
    {id: 13, fecha: yesterday, lugar: "Carnicería El Buen Sabor", concepto: "Pollo entero", monto: 27000},
    {id: 14, fecha: today, lugar: "Plaza de mercado", concepto: "Cilantro y tomate", monto: 9400},
    {id: 15, fecha: yesterday, lugar: "Papelería Mundo Color", concepto: "Resma de papel", monto: 12500},
    {id: 16, fecha: today, lugar: "Ferretería Central", concepto: "Llaves y clavos", monto: 11200},
    {id: 17, fecha: yesterday, lugar: "Supermercado La 80", concepto: "Salsas y especias", monto: 8800},
    {id: 18, fecha: today, lugar: "Tienda Don Luis", concepto: "Hielo", monto: 7000},
    {id: 19, fecha: yesterday, lugar: "Frutería Las Delicias", concepto: "Mango y banano", monto: 9900},
    {id: 20, fecha: today, lugar: "Panadería El Trigal", concepto: "Galletas y jugo", monto: 11700},
    {id: 21, fecha: yesterday, lugar: "Plaza de mercado", concepto: "Papas y cebolla", monto: 15800},
    {id: 22, fecha: today, lugar: "Papelería Mundo Color", concepto: "Tijeras y lápices", monto: 6800},
    {id: 23, fecha: today, lugar: "Carnicería El Buen Sabor", concepto: "Costilla de res", monto: 29000},
    {id: 24, fecha: yesterday, lugar: "Droguería Pasteur", concepto: "Mascarillas", monto: 4500},
    {id: 25, fecha: today, lugar: "Supermercado La 80", concepto: "Detergente y esponjas", monto: 14200},
    {id: 26, fecha: yesterday, lugar: "Ferretería Central", concepto: "Clavos y cinta de embalar", monto: 9100},
    {id: 27, fecha: today, lugar: "Panadería El Trigal", concepto: "Pan tajado", monto: 9500},
    {id: 28, fecha: today, lugar: "Frutería Las Delicias", concepto: "Uvas y peras", monto: 14300},
    {id: 29, fecha: yesterday, lugar: "Tienda Don Luis", concepto: "Servilletas", monto: 5600},
    {id: 30, fecha: today, lugar: "Supermercado La 80", concepto: "Botellas de agua", monto: 10800}
];

// --- FUNCIONES DE MANIPULACIÓN DE ESTADO ---
export function setTransacciones(newTransacciones) {
    transacciones = newTransacciones;
}

export let currentCart = [];
export function setCurrentCart(newCart) {
    currentCart = newCart;
}