/*
 * Página y coordinación de la vista.
 * Lee el identificador de la ruta, consulta el pedido autorizado y presenta su detalle o un estado
 * recuperable cuando no existe.
 */

import { Link, useParams } from "react-router-dom";
import { getManagedOrder } from "../services/adminOrders.js";
import { parseOrderId } from "../utils/orders.js";
import OrderItemsTable from "../components/organisms/OrderItemsTable.jsx";
import OrderSummary from "../components/organisms/OrderSummary.jsx";

function AdminOrderDetailPage() {
    const { id } = useParams();
    const resource = getManagedOrder(parseOrderId(id));
    return <>
        <header className="kynex-admin-heading">
            <div><p className="kynex-eyebrow">PEDIDOS KYNEX</p><h1>{resource.success ? `Pedido #${resource.order.id}` : resource.code === "NOT_FOUND" ? "Pedido no encontrado" : "Pedido no disponible"}</h1><p>Información del pedido seleccionado.</p></div>
            <Link className="btn btn-outline-light" to="/admin/pedidos"><i className="bi bi-arrow-left me-2" aria-hidden="true" />Volver a pedidos</Link>
        </header>
        {resource.success ? <><OrderSummary order={resource.order} /><OrderItemsTable products={resource.order.products} /></>
            : <p className="auth-form-alert" role="alert">{resource.message}</p>}
    </>;
}

export default AdminOrderDetailPage;
