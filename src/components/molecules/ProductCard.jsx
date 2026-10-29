/*
 * Molécula reutilizable.
 * Presenta los datos de un producto y compone imagen, etiquetas, precio y botón. Al agregar comprueba
 * disponibilidad y entrega el producto al callback recibido.
 */

import {
    Link
} from "react-router-dom";

import Badge from "../atoms/Badge.jsx";
import Button from "../atoms/Button.jsx";
import Price from "../atoms/Price.jsx";
import StockBadge from "../atoms/StockBadge.jsx";
import ProductImage from "../atoms/ProductImage.jsx";
import { productList } from "../../utils/productDetails.js";

function ProductCard({
    product,
    onAddToCart,
    headingLevel = 2
}) {
    const Heading = `h${headingLevel}`;
    const isOutOfStock =
        Number(product.stock) <= 0;

    const canAddToCart =
        typeof onAddToCart ===
        "function";

    // El botón comunica el producto mediante la función recibida. El contexto conserva la
    // responsabilidad final sobre cantidades y stock.
    function handleAddToCart() {
        if (
            isOutOfStock
            ||
            !canAddToCart
        ) {
            return;
        }

        onAddToCart(
            product
        );
    }

    return (
        <article className="shop-product-card">
            <div className="shop-product-visual">
                <StockBadge
                    stock={product.stock}
                    criticalStock={product.criticalStock}
                />

                <ProductImage product={product} />
            </div>

            <div className="shop-product-body">
                <div className="shop-product-meta">
                    <Badge>
                        {product.category}
                    </Badge>

                    <span>
                        {product.code}
                    </span>
                </div>

                <Heading>
                    {product.name}
                </Heading>

                <p>
                    {product.description}
                </p>

                <div className="product-tags">
                    {productList(product.goals).slice(0, 2).map(goal => <span className="product-tag" key={goal}>{goal}</span>)}
                    <span className="product-tag">
                        {product.format}
                    </span>

                    <span className="product-tag">
                        {product.flavor}
                    </span>
                </div>

                <div className="shop-product-bottom">
                    <Price
                        value={product.price}
                    />

                    <div className="shop-product-actions">
                        <Link
                            className="btn btn-outline-light"
                            to={`/productos/${product.id}`}
                        >
                            Ver detalle
                        </Link>

                        <Button
                            disabled={
                                isOutOfStock
                                ||
                                !canAddToCart
                            }
                            onClick={handleAddToCart}
                        >
                            Agregar
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
