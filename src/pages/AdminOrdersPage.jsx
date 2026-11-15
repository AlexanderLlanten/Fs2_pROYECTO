/*
 * Página y coordinación de la vista.
 * Consulta los pedidos demostrativos autorizados y los presenta en una tabla con estados de error.
 */

import useAuth from "../hooks/useAuth.js";
import { listManagedOrders } from "../services/adminOrders.js";
import OrdersTable from "../components/organisms/OrdersTable.jsx";
import { usesApi } from "../config/dataSource.js";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";

function LocalAdminOrdersPage() {
    const { refreshSession } = useAuth();
    const resource = listManagedOrders();
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">VENTAS KYNEX</p><h1>Pedidos</h1><p>Consulta los pedidos registrados y su estado.</p></div></header>
        {resource.success ? <>
            <p className="kynex-users-count">{resource.orders.length} pedidos demostrativos</p>
            <OrdersTable orders={resource.orders} />
        </> : <div><p className="auth-form-alert" role="alert">{resource.message}</p><button className="btn btn-outline-light mt-3" onClick={refreshSession}>Revisar acceso</button></div>}
    </>;
}

function RemoteAdminOrdersPage() {
    const resource = useApiResource("/admin/orders");
    return <><header className="kynex-admin-heading"><div><p className="kynex-eyebrow">VENTAS KYNEX</p><h1>Pedidos</h1><p>Consulta compras registradas y resultados del pago emulado.</p></div></header>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <OrdersTable orders={resource.data} />}
    </>;
}
function AdminOrdersPage() { return usesApi ? <RemoteAdminOrdersPage /> : <LocalAdminOrdersPage />; }

export default AdminOrdersPage;
