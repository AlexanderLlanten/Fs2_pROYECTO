import {
    Link
} from "react-router-dom";

import CartItem from "../components/molecules/CartItem.jsx";
import CartSummary from "../components/organisms/CartSummary.jsx";

import useCart from "../hooks/useCart.js";
import useCatalog from "../hooks/useCatalog.js";
import CatalogError from "../components/molecules/CatalogError.jsx";

function CartPage() {
    const catalog = useCatalog();
    const {
        detailedCart,
        totalItems,
        subtotal,
        shipping,
        total,
        missingForFreeShipping,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        storageError
    } = useCart();

    return (
        <>
            <section className="cart-page-header">
                <div className="container">
                    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                        <div>
                            <p className="kynex-eyebrow">
                                TU COMPRA
                            </p>

                            <h1>
                                Carrito de compras
                            </h1>

                            <p>
                                Revisa productos, cantidades y total antes de continuar.
                            </p>
                        </div>

                        <Link
                            className="btn btn-outline-light"
                            to="/productos"
                        >
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            </section>

            <section className="cart-page-section">
                <div className="container">
                    {storageError && <p className="auth-form-alert" role="alert">{storageError}</p>}
                    {
                        !catalog.success ? <CatalogError resource={catalog} /> : detailedCart.length === 0
                            ? (
                                <div className="catalog-empty">
                                    <i
                                        className="bi bi-cart-x"
                                        aria-hidden="true"
                                    />

                                    <h2>
                                        Tu carrito está vacío
                                    </h2>

                                    <p>
                                        Agrega productos desde el catálogo para comenzar tu compra.
                                    </p>

                                    <Link
                                        className="btn btn-success mt-3"
                                        to="/productos"
                                    >
                                        Ir a productos
                                    </Link>
                                </div>
                            )
                            : (
                                <div className="row g-4 align-items-start">
                                    <div className="col-12 col-xl-8">
                                        <div className="cart-items-react">
                                            {
                                                detailedCart.map(
                                                    product => (
                                                        <CartItem
                                                            key={product.id}
                                                            product={product}
                                                            onIncrease={
                                                                () =>
                                                                    increaseQuantity(
                                                                        product.id
                                                                    )
                                                            }
                                                            onDecrease={
                                                                () =>
                                                                    decreaseQuantity(
                                                                        product.id
                                                                    )
                                                            }
                                                            onRemove={
                                                                () =>
                                                                    removeFromCart(
                                                                        product.id
                                                                    )
                                                            }
                                                        />
                                                    )
                                                )
                                            }
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger mt-4"
                                            onClick={clearCart}
                                        >
                                            Vaciar carrito
                                        </button>
                                    </div>

                                    <div className="col-12 col-xl-4">
                                        <CartSummary
                                            totalItems={totalItems}
                                            subtotal={subtotal}
                                            shipping={shipping}
                                            total={total}
                                            missingForFreeShipping={missingForFreeShipping}
                                        />
                                    </div>
                                </div>
                            )
                    }
                </div>
            </section>
        </>
    );
}

export default CartPage;
