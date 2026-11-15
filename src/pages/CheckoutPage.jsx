import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useCart from "../hooks/useCart.js";
import DeliveryForm from "../components/organisms/DeliveryForm.jsx";
import CartSummary from "../components/organisms/CartSummary.jsx";
import { commerce } from "../services/api/commerce.js";

export default function CheckoutPage() {
    const { user } = useAuth(); const cart = useCart(); const navigate = useNavigate();
    return <section className="container my-5"><p className="kynex-eyebrow">TU COMPRA</p><h1>Confirmar entrega</h1>
        <p>Revisa tu dirección. El pedido quedará pendiente hasta completar el pago de prueba.</p>
        {cart.cartLoading ? <p role="status">Cargando carrito…</p> : <>
            {cart.storageError && <p className="auth-form-alert" role="alert">{cart.storageError}</p>}
            {!cart.canCheckout ? <p role="alert">Revisa los productos y sus cantidades antes de continuar. <Link to="/carrito">Volver al carrito</Link></p>
                : <div className="row g-4"><div className="col-lg-7 auth-form-panel"><h2>Dirección de entrega</h2>
                    <DeliveryForm user={user} disabled={cart.cartBusy || !!cart.storageError} onSubmit={async delivery => {
                        const order = await commerce.checkout(user.id, cart.version, delivery); navigate(`/compras/${order.id}`);
                    }} />
                </div><div className="col-lg-5"><CartSummary {...cart} hideAction /></div></div>}
        </>}
    </section>;
}
