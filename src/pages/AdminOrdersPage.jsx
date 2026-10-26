import useAuth from "../hooks/useAuth.js";
import { listManagedOrders } from "../services/adminOrders.js";
import OrdersTable from "../components/organisms/OrdersTable.jsx";

function AdminOrdersPage() {
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

export default AdminOrdersPage;
