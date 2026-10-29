/*
 * Reglas y funciones auxiliares.
 * Valida el identificador de un pedido y calcula sus importes con los datos históricos del propio
 * pedido.
 */

// Calcula los importes con los datos históricos del pedido, sin consultar precios vigentes del
// catálogo.
export function calculateOrderSummary(order) {
    const products = Array.isArray(order?.products) ? order.products : [];
    return products.reduce((summary, product) => ({
        quantity: summary.quantity + product.quantity,
        total: summary.total + product.price * product.quantity
    }), { quantity: 0, total: 0 });
}

// Acepta un identificador formado por dígitos y devuelve su número entero seguro positivo; para un
// dato inválido devuelve null.
export function parseOrderId(value) {
    return /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
}
