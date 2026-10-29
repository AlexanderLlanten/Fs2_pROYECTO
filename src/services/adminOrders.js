/*
 * Servicio local de datos y operaciones.
 * Consulta tres pedidos demostrativos tras comprobar el permiso de la sesión. Devuelve copias y
 * totales basados en datos históricos; no permite modificar estados ni crear pedidos.
 */

import { orders } from "../data/orders.js";
import { calculateOrderSummary } from "../utils/orders.js";
import { hasPermission, PERMISSIONS } from "../utils/permissions.js";
import { getSession } from "./auth.js";

// Comprueba el permiso de consulta y devuelve copias de pedidos con sus importes calculados.
export function listManagedOrders() {
    if (!hasPermission(getSession()?.role, PERMISSIONS.ORDERS_VIEW)) {
        return { success: false, code: "FORBIDDEN", message: "No tienes permiso para consultar pedidos con la sesión actual." };
    }
    // Devolver copias para que un consumidor no modifique los pedidos demostrativos.
    return { success: true, orders: orders.map(order => ({
        ...order, customer: { ...order.customer }, products: order.products.map(product => ({ ...product })),
        ...calculateOrderSummary(order)
    })) };
}

// Busca un pedido autorizado por identificador entero positivo y comunica si no existe.
export function getManagedOrder(id) {
    const result = listManagedOrders();
    if (!result.success) return result;
    const order = Number.isSafeInteger(id) && id > 0 && result.orders.find(item => item.id === id);
    return order ? { success: true, order } : { success: false, code: "NOT_FOUND", message: "El pedido solicitado no existe." };
}
