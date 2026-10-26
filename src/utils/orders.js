export function calculateOrderSummary(order) {
    const products = Array.isArray(order?.products) ? order.products : [];
    return products.reduce((summary, product) => ({
        quantity: summary.quantity + product.quantity,
        total: summary.total + product.price * product.quantity
    }), { quantity: 0, total: 0 });
}

export function parseOrderId(value) {
    return /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
}
