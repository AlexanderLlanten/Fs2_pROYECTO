/*
 * Organismo de interfaz.
 * Presenta unidades, subtotal, despacho y total. Al continuar muestra el aviso de checkout futuro; no
 * crea pedidos ni procesa pagos.
 */

import { useId, useState } from "react";
import Price from "../atoms/Price.jsx";

function CartSummary({
    totalItems,
    subtotal,
    shipping,
    total,
    missingForFreeShipping
}) {
    // El estado controla la aparición del aviso de checkout futuro al pulsar Continuar compra.
    const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);
    const noticeId = useId();
    // Los importes llegan calculados por el carrito. Este componente decide el mensaje visible y el
    // aviso demostrativo de continuación de compra.
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
                onClick={() => setShowCheckoutNotice(true)}
                aria-describedby={showCheckoutNotice && totalItems > 0 ? noticeId : undefined}
                disabled={
                    totalItems === 0
                }
            >
                Continuar compra
            </button>
            <p id={noticeId} className="cart-checkout-notice" role="status" aria-live="polite" aria-atomic="true">
                {showCheckoutNotice && totalItems > 0
                    ? "El proceso de checkout será implementado en una etapa posterior."
                    : ""}
            </p>
        </aside>
    );
}

export default CartSummary;
