import Price from "../atoms/Price.jsx";

function CartSummary({
    totalItems,
    subtotal,
    shipping,
    total,
    missingForFreeShipping
}) {
    let shippingMessage =
        "Agrega productos para calcular el despacho.";

    if (
        subtotal >=
        50000
    ) {
        shippingMessage =
            "Tu compra obtiene despacho gratuito.";
    } else if (
        missingForFreeShipping >
        0
    ) {
        shippingMessage =
            `Te faltan $${missingForFreeShipping.toLocaleString("es-CL")} para obtener despacho gratuito.`;
    }

    return (
        <aside className="cart-summary-react">
            <h2>
                Resumen
            </h2>

            <dl>
                <div>
                    <dt>
                        Productos
                    </dt>

                    <dd>
                        {totalItems}
                    </dd>
                </div>

                <div>
                    <dt>
                        Subtotal
                    </dt>

                    <dd>
                        <Price
                            value={subtotal}
                            label=""
                        />
                    </dd>
                </div>

                <div>
                    <dt>
                        Despacho
                    </dt>

                    <dd>
                        {
                            shipping === 0
                            &&
                            subtotal > 0
                                ? "Gratis"
                                : new Intl.NumberFormat(
                                    "es-CL",
                                    {
                                        style: "currency",
                                        currency: "CLP",
                                        maximumFractionDigits: 0
                                    }
                                ).format(
                                    shipping
                                )
                        }
                    </dd>
                </div>
            </dl>

            <div className="cart-summary-total">
                <Price
                    value={total}
                    label="Total"
                />
            </div>

            <p>
                {shippingMessage}
            </p>

            <button
                type="button"
                className="btn btn-success w-100"
                disabled={
                    totalItems === 0
                }
            >
                Continuar compra
            </button>
        </aside>
    );
}

export default CartSummary;
