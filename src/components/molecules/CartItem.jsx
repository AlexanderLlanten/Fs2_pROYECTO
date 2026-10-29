/*
 * Molécula reutilizable.
 * Presenta una línea de compra con fotografía, detalle, precio por cantidad y controles. Los eventos
 * llaman a las funciones de aumentar, disminuir o retirar recibidas.
 */

import {
    Link
} from "react-router-dom";

import Price from "../atoms/Price.jsx";
import ProductImage from "../atoms/ProductImage.jsx";
import QuantitySelector from "./QuantitySelector.jsx";

function CartItem({
    product,
    onIncrease,
    onDecrease,
    onRemove
}) {
    // El total de esta línea es precio por cantidad. Aumentar, disminuir y eliminar se comunican a
    // las funciones recibidas por propiedades.
    const lineTotal =
        product.price
        *
        product.quantity;

    return (
        <article className="cart-item-react">
            <div className="cart-item-react-visual">
                <ProductImage product={product} />
            </div>

            <div className="cart-item-react-info">
                <span>
                    {product.category}
                </span>

                <h2>
                    {product.name}
                </h2>

                <p>
                    {product.format}
                    {" · "}
                    {product.flavor}
                </p>

                <Link
                    to={`/productos/${product.id}`}
                >
                    Ver detalle
                </Link>
            </div>

            <QuantitySelector
                quantity={product.quantity}
                disabledIncrease={
                    product.quantity >=
                    product.stock
                }
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                label={`Cantidad de ${product.name}`}
            />

            <Price
                value={lineTotal}
                label="Total"
            />

            <button
                type="button"
                className="cart-remove-button-react"
                aria-label={`Eliminar ${product.name} del carrito`}
                onClick={onRemove}
            >
                <i
                    className="bi bi-trash"
                    aria-hidden="true"
                />
            </button>
        </article>
    );
}

export default CartItem;
