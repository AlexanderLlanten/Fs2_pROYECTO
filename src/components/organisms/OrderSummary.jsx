/*
 * Organismo de interfaz.
 * Presenta identidad, cliente, estado e importes del pedido recibido.
 */

import { useId } from "react";
import OrderStatusBadge from "../atoms/OrderStatusBadge.jsx";
import Price from "../atoms/Price.jsx";

function OrderSummary({ order }) {
    const titleId = useId();
    return <section className="kynex-order-summary mb-4" aria-labelledby={titleId}>
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <h2 id={titleId}>Resumen del pedido</h2><OrderStatusBadge status={order.status} />
        </div>
        <div className="row g-4">
            <div className="col-md-6"><p className="kynex-eyebrow">CLIENTE</p><strong>{order.customer.name}</strong><p className="kynex-order-email">{order.customer.email}</p></div>
            <div className="col-md-6"><dl className="kynex-order-facts">
                <div><dt>Fecha</dt><dd><time dateTime={order.date}>{order.date}</time></dd></div>
                <div><dt>Unidades</dt><dd>{order.quantity}</dd></div>
            </dl><Price value={order.total} label="Total de productos" /></div>
        </div>
        <p className="kynex-order-note mb-0 mt-3">Los importes corresponden a los productos del pedido registrado.</p>
    </section>;
}

export default OrderSummary;
