import { Link, useParams } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import OrderSummary from "../components/organisms/OrderSummary.jsx";
import OrderItemsTable from "../components/organisms/OrderItemsTable.jsx";
import PaymentPanel from "../components/organisms/PaymentPanel.jsx";
export default function MyOrderDetailPage() {
    const { id } = useParams(); const resource = useApiResource(`/orders/${id}`);
    return <section className="container my-5"><p className="kynex-eyebrow">MI COMPRA</p><h1>Pedido #{id}</h1>
        <Link to="/compras" className="btn btn-outline-light mb-4">Volver a mis compras</Link>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <>
            <OrderSummary order={resource.data} /><OrderItemsTable products={resource.data.products} />
            <PaymentPanel order={resource.data} onChange={updated => updated ? resource.update(updated) : resource.reload()} />
        </>}
    </section>;
}
