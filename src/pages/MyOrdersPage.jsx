import { Link } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import OrdersTable from "../components/organisms/OrdersTable.jsx";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
export default function MyOrdersPage() {
    const resource = useApiResource("/orders");
    return <section className="container my-5"><p className="kynex-eyebrow">MI KYNEX</p><h1>Mis compras</h1>
        <p>Consulta tus pedidos y los resultados del pago de prueba.</p>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <OrdersTable orders={resource.data} basePath="/compras" />}
        <Link className="btn btn-outline-light mt-4" to="/productos">Volver a la tienda</Link>
    </section>;
}
