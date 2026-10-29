/*
 * Página y coordinación de la vista.
 * Lee y valida el id de la ruta, busca el producto y calcula la cantidad disponible considerando el
 * carrito. Compone imagen, ficha, información ampliada y selección de unidades.
 */

import {
    Link,
    useParams
} from "react-router-dom";

import {
    useState
} from "react";

import Price from "../components/atoms/Price.jsx";
import StockBadge from "../components/atoms/StockBadge.jsx";

import useCatalog from "../hooks/useCatalog.js";
import CatalogError from "../components/molecules/CatalogError.jsx";
import ProductImage from "../components/atoms/ProductImage.jsx";
import Badge from "../components/atoms/Badge.jsx";
import QuantitySelector from "../components/molecules/QuantitySelector.jsx";
import ProductInformation from "../components/organisms/ProductInformation.jsx";
import { parseProductId } from "../utils/products.js";
import { productList, productText } from "../utils/productDetails.js";

import useCart from "../hooks/useCart.js";

function ProductDetailPage() {
    const catalog = useCatalog();
    const { products } = catalog;
    const {
        id
    } = useParams();

    const {
        addToCart,
        detailedCart
    } = useCart();

    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [
        feedback,
        setFeedback
    ] = useState(null);
    const [selection, setSelection] = useState({ id: null, quantity: 1 });

    const product =
        products.find(
            item =>
                item.id ===
                parseProductId(id)
        );

    if (!catalog.success) return <section className="product-detail-section"><div className="container"><h1>Catálogo no disponible</h1><CatalogError resource={catalog} /></div></section>;

    if (!product) {
        return (
            <>
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
            </>
        );
    }

    // Se descuenta lo ya agregado para calcular stock restante. Cada nueva adición permite como
    // máximo diez unidades y nunca supera ese stock.
    const inCart = detailedCart.find(item => item.id === product.id)?.quantity ?? 0;
    const maximum = Math.min(10, Math.max(0, product.stock - inCart));
    const quantity = maximum === 0 ? 0 : Math.min(selection.id === product.id ? selection.quantity : 1, maximum);

    // Responde al clic de compra y comunica la operación al callback o al contexto del carrito; este
    // último controla el stock vigente.
    function handleAddToCart() {
        if (!quantity) return;
        addToCart(product, quantity);
        setFeedback({ id: product.id, message: quantity === 1 ? "Producto agregado al carrito." : `${quantity} productos agregados al carrito.` });
    }

    return (
        <>
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

                    <div className="row gx-4 gy-5 align-items-start">
                        <div className="col-12 col-lg-6">
                            <div className="product-detail-visual-react">
                                <StockBadge
                                    stock={product.stock}
                                    criticalStock={product.criticalStock}
                                />

                                <ProductImage product={product} />
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
                                    Código{" "}

                                    <span>
                                        {product.code}
                                    </span>
                                </p>

                                <p className="product-detail-description-react">
                                    {product.description}
                                </p>

                                <div className="product-detail-tags" aria-label="Objetivos y características">
                                    {[...productList(product.goals), ...productList(product.dietaryTags)].map((value, index) => <Badge key={`${index}-${value}`}>{value}</Badge>)}
                                </div>

                                <div className="product-detail-attributes-react">
                                    <div>
                                        <span>
                                            Formato
                                        </span>

                                        <strong>
                                            {productText(product.format, "Sin especificar")}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Sabor
                                        </span>

                                        <strong>
                                            {productText(product.flavor, "Sin especificar")}
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
                                            {productText(product.brand)}
                                        </strong>
                                    </div>
                                </div>

                                <QuantitySelector label="Cantidad a agregar" quantity={quantity}
                                    onIncrease={() => setSelection({ id: product.id, quantity: Math.min(quantity + 1, maximum) })}
                                    onDecrease={() => setSelection({ id: product.id, quantity: Math.max(1, quantity - 1) })}
                                    disabledIncrease={quantity >= maximum} disabledDecrease={quantity <= 1} />
                                <p className="product-detail-note">Hasta 10 unidades por adición, según el stock que queda disponible.</p>

                                <div className="product-detail-purchase-react">
                                    <Price
                                        value={product.price}
                                    />

                                    <button
                                        className="btn btn-success"
                                        type="button"
                                        disabled={
                                            maximum === 0
                                        }
                                        onClick={handleAddToCart}
                                    >
                                        Agregar al carrito
                                    </button>
                                </div>

                                <p
                                    className="product-detail-note"
                                    aria-live="polite"
                                >
                                    {feedback?.id === product.id ? feedback.message : ""}
                                </p>
                                {product.stock > 0 && maximum === 0 && <p className="product-detail-note" aria-live="polite">Ya tienes todo el stock disponible en tu carrito.</p>}

                                <Link
                                    className="btn btn-outline-light mt-2"
                                    to="/carrito"
                                >
                                    Ver carrito
                                </Link>
                            </div>
                        </div>
                    </div>
                    <ProductInformation product={product} />
                </div>
            </section>
        </>
    );
}

export default ProductDetailPage;
