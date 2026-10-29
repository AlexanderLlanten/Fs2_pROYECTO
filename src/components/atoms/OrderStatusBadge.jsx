/*
 * Átomo reutilizable.
 * Representa el estado de un pedido mediante una etiqueta. Centraliza cómo se muestra ese estado en
 * las tablas y el detalle.
 */

import Badge from "./Badge.jsx";

const modifiers = { Pendiente: "pending", Preparación: "preparation", Despachado: "shipped" };

function OrderStatusBadge({ status }) {
    return <Badge className={`kynex-order-status kynex-order-status--${modifiers[status] ?? "default"}`}>{status}</Badge>;
}

export default OrderStatusBadge;
