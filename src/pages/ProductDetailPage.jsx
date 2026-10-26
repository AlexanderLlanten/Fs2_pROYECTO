import {
    Link,
    useParams
} from "react-router-dom";

import Price from "../components/atoms/Price.jsx";
import StockBadge from "../components/atoms/StockBadge.jsx";

import {
    products
} from "../data/products.js";

function ProductDetailPage() {
    const {
        id
    } = useParams();

    const product =
        products.find(
            item =>
                item.id ===
                Number(id)
        );

    if (!product) {
        return (
            <main>
                <section className="product-detail-section">
                    <div className="container">
                        <div className="catalog-empty">
                            <i
                                className="bi bi-exclamation-circle"
                                aria-hidden="true"
                            />

                            <h1>
                                Producto no encontrado
                            </h1>

                            <p>
                                El producto solicitado no existe en el catálogo.
                            </p>

                            <Link
                                className="btn btn-outline-light mt-3"
                                to="/productos"
                            >
                                Volver al catálogo
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main>
            <section className="product-detail-section">
                <div className="container">
                    <div className="mb-4">
                        <Link
                            className="product-detail-back"
                            to="/productos"
                        >
                            <i
                                className="bi bi-arrow-left"
                                aria-hidden="true"
                            />

                            Volver al catálogo
                        </Link>
                    </div>

                    <div className="row g-5 align-items-start">
                        <div className="col-12 col-lg-6">
                            <div className="product-detail-visual-react">
                                <StockBadge
                                    stock={product.stock}
                                    criticalStock={product.criticalStock}
                                />

                                <i
                                    className={`bi ${product.icon || "bi-box-seam"}`}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="product-detail-content">
                                <p className="kynex-eyebrow">
                                    {product.category}
                                </p>

                                <h1>
                                    {product.name}
                                </h1>

                                <p className="product-detail-code">
                                    Código {product.code}
                                </p>

                                <p className="product-detail-description-react">
                                    {product.description}
                                </p>

                                <div className="product-detail-attributes-react">
                                    <div>
                                        <span>
                                            Formato
                                        </span>

                                        <strong>
                                            {product.format}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Sabor
                                        </span>

                                        <strong>
                                            {product.flavor}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Stock
                                        </span>

                                        <strong>
                                            {product.stock} unidades
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Marca
                                        </span>

                                        <strong>
                                            {product.brand}
                                        </strong>
                                    </div>
                                </div>

                                <div className="product-detail-purchase-react">
                                    <Price
                                        value={product.price}
                                    />

                                    <button
                                        className="btn btn-success"
                                        type="button"
                                        disabled
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>

                                <p className="product-detail-note">
                                    El carrito se habilitará en la siguiente etapa
                                    de la migración mediante estado global.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default ProductDetailPage;
