import { apiSession } from "./session.js";

// Las claves sobreviven a una recarga; nunca contienen dirección, contraseña ni tokens.
export async function operationKey(scope, data, renew = false) {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map(byte => byte.toString(16).padStart(2, "0")).join("");
    const key = `kynex_operation_${scope}_${hash}`;
    const previous = sessionStorage.getItem(key);
    if (previous && !renew) return previous;
    const value = crypto.randomUUID(); sessionStorage.setItem(key, value); return value;
}
export const commerce = {
    async checkout(ownerId, version, delivery) {
        const checkSession = apiSession.guard();
        const payload = { version, delivery };
        let requestId = await operationKey(`checkout_${ownerId}`, payload);
        checkSession();
        let order = await apiSession.authorized("/orders", { method: "POST", body: { requestId, version, delivery } });
        if (["EXPIRED", "CANCELLED"].includes(order.status)) {
            requestId = await operationKey(`checkout_${ownerId}`, payload, true);
            checkSession();
            order = await apiSession.authorized("/orders", { method: "POST", body: { requestId, version, delivery } });
        }
        return order;
    },
    async payment(order, scenario) {
        const checkSession = apiSession.guard();
        const requestId = await operationKey(`payment_${order.id}`, { scenario, attempt: order.payments.length });
        checkSession();
        return apiSession.authorized(`/orders/${order.id}/payments`, { method: "POST", body: { requestId, scenario } });
    },
    confirm: (orderId, paymentId) => apiSession.authorized(`/orders/${orderId}/payments/${paymentId}/confirm`, { method: "POST", body: {} }),
    transition: (id, version, status, reason) => apiSession.authorized(`/admin/orders/${id}/status`, { method: "PUT", body: { version, status, reason } })
};
export const orderLabels = { PENDING: "Pendiente de pago", CONFIRMED: "Confirmado", PREPARING: "En preparación", SHIPPED: "Despachado", DELIVERED: "Entregado", CANCELLED: "Anulado", EXPIRED: "Vencido" };
export const paymentLabels = { PENDING: "Pendiente", APPROVED: "Aprobado en pruebas", REJECTED: "Rechazado", CANCELLED: "Cancelado", EXPIRED: "Expirado", ERROR: "Error técnico de prueba" };
export const scenarioLabels = { APPROVE: "Aprobación", REJECT: "Rechazo", CANCEL: "Cancelación", EXPIRE: "Expiración", TECHNICAL_ERROR: "Error técnico" };
export const nextStates = { PENDING: ["CANCELLED"], CONFIRMED: ["PREPARING", "CANCELLED"], PREPARING: ["SHIPPED", "CANCELLED"], SHIPPED: ["DELIVERED"] };
