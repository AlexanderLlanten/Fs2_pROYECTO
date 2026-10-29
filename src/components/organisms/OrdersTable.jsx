/*
 * Organismo de interfaz.
 * Presenta los pedidos disponibles y enlaza con sus detalles.
 */

import { Link } from "react-router-dom";
import OrderStatusBadge from "../atoms/OrderStatusBadge.jsx";
import { formatPrice } from "../atoms/Price.jsx";

function OrdersTable({ orders }) {
    if (!orders.length) return <p role="status">No hay pedidos disponibles.</p>;
    return <div className="table-responsive kynex-users-table-wrap" tabIndex={0} role="region"
        aria-label="Listado de pedidos">
        <table className="table align-middle kynex-users-table kynex-orders-table">
            <caption className="visually-hidden">Pedidos registrados en KYNEX</caption>
            <thead>
                <tr>{["Pedido", "Fecha", "Cliente", "Unidades", "Total de productos", "Estado", "Detalle"].map(label => <th
                        key={label} scope="col">{label}</th>)}</tr>
            </thead>
            <tbody>{orders.map(order => <tr key={order.id}>
                    <th scope="row">#{order.id}</th>
                    <td><time dateTime={order.date}>{order.date}</time></td>
                    <td><strong>{order.customer.name}</strong><span
                            className="kynex-order-email">{order.customer.email}</span></td>
                    <td>{order.quantity}</td>
                    <td className="text-nowrap">{formatPrice(order.total)}</td>
                    <td>
                        <OrderStatusBadge status={order.status} />
                    </td>
                    <td>
                        <Link className="btn btn-outline-light btn-sm" to={`/admin/pedidos/${order.id}`}
                            aria-label={`Ver pedido ${order.id}`}>Ver detalle</Link>
                    </td>
                </tr>)}</tbody>
        </table>
    </div>;
}

export default OrdersTable;
