import {
    Link
} from "react-router-dom";

import Badge from "../atoms/Badge.jsx";
import Button from "../atoms/Button.jsx";
import Price from "../atoms/Price.jsx";
import StockBadge from "../atoms/StockBadge.jsx";

function ProductCard({
    product,
    onAddToCart
}) {
    const isOutOfStock =
        Number(product.stock) <= 0;

    const canAddToCart =
        typeof onAddToCart ===
        "function";

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

                <i
                    className={`bi ${product.icon || "bi-box-seam"}`}
                    aria-hidden="true"
                />
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

                <h2>
                    {product.name}
                </h2>

                <p>
                    {product.description}
                </p>

                <div className="product-tags">
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
