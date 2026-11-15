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
import { usesApi } from "../config/dataSource.js";
import useApiResource from "../hooks/useApiResource.js";
import useAuth from "../hooks/useAuth.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import OrderStateForm from "../components/organisms/OrderStateForm.jsx";
import { PERMISSIONS } from "../utils/permissions.js";

function LocalAdminOrderDetailPage() {
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

function RemoteAdminOrderDetailPage() {
    const { id } = useParams(); const resource = useApiResource(`/admin/orders/${id}`); const { hasPermission } = useAuth();
    return <><header className="kynex-admin-heading"><h1>Pedido #{id}</h1><Link className="btn btn-outline-light" to="/admin/pedidos">Volver a pedidos</Link></header>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <>
            <OrderSummary order={resource.data} /><OrderItemsTable products={resource.data.products} />
            {hasPermission(PERMISSIONS.ORDERS_MANAGE) && <OrderStateForm order={resource.data} onChange={resource.update} />}
            <h2>Historial de estados</h2><ul>{resource.data.events.map((event,index) => <li key={index}>{event.note}</li>)}</ul>
        </>}
    </>;
}
function AdminOrderDetailPage() { return usesApi ? <RemoteAdminOrderDetailPage /> : <LocalAdminOrderDetailPage />; }

export default AdminOrderDetailPage;
