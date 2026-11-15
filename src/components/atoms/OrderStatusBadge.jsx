/*
 * Átomo reutilizable.
 * Representa el estado de un pedido mediante una etiqueta. Centraliza cómo se muestra ese estado en
 * las tablas y el detalle.
 */

import Badge from "./Badge.jsx";
import { orderLabels } from "../../services/api/commerce.js";

const modifiers = { Pendiente: "pending", Preparación: "preparation", Despachado: "shipped" };

function OrderStatusBadge({ status }) {
    return <Badge className={`kynex-order-status kynex-order-status--${modifiers[status] ?? "default"}`}>{orderLabels[status] || status}</Badge>;
}

export default OrderStatusBadge;
