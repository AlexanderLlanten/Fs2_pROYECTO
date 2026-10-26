import { useState } from "react";
import { Link } from "react-router-dom";

import SectionHeading from "../components/molecules/SectionHeading.jsx";
import CategoryGrid from "../components/organisms/CategoryGrid.jsx";
import FeaturedProducts from "../components/organisms/FeaturedProducts.jsx";
import HomeHero from "../components/organisms/HomeHero.jsx";
import FeatureSection from "../components/organisms/FeatureSection.jsx";
import { homeCategories, homeFeatures } from "../data/home.js";
import useCatalog from "../hooks/useCatalog.js";
import CatalogError from "../components/molecules/CatalogError.jsx";
import useCart from "../hooks/useCart.js";
import { FREE_SHIPPING_FROM } from "../utils/cart.js";

const freeShippingAmount = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
}).format(FREE_SHIPPING_FROM);

function HomePage() {
    const catalog = useCatalog();
    const { products } = catalog;
    const { addToCart, detailedCart } = useCart();
    const [feedback, setFeedback] = useState("");

    function handleAddToCart(product) {
        const currentQuantity = detailedCart.find(item => item.id === product.id)?.quantity ?? 0;

        if (currentQuantity >= product.stock) {
            setFeedback(`Ya alcanzaste el stock disponible de ${product.name} en tu carrito.`);
            return;
        }

        addToCart(product);
        setFeedback(`Agregaste ${product.name} al carrito.`);
    }

    return (
        <>
            <HomeHero />

            <section className="home-shipping" aria-label="Información de despacho">
                <div className="container">
                    <p>
                        <i className="bi bi-truck" aria-hidden="true" />
                        <span>Despacho gratis en compras desde <strong>{freeShippingAmount}</strong></span>
                    </p>
                </div>
            </section>

            <section className="home-section" aria-labelledby="categories-title">
                <div className="container">
                    <SectionHeading
                        id="categories-title"
                        eyebrow="ENCUENTRA TU COMPLEMENTO"
                        title="Explora por categoría"
                        description="Encuentra suplementos según el tipo de producto que buscas."
                    />
                    <CategoryGrid categories={homeCategories} />
                </div>
            </section>

            {!catalog.success ? <div className="container"><CatalogError resource={catalog} /></div> : <FeaturedProducts
                products={products}
                onAddToCart={handleAddToCart}
                feedback={feedback}
            />}

            <FeatureSection
                id="value-title"
                eyebrow="LA EXPERIENCIA KYNEX"
                title="Todo lo necesario para avanzar"
                description="Una experiencia de compra pensada para acompañar tus decisiones."
                features={homeFeatures}
            />

            <section className="home-section pt-0" aria-labelledby="home-cta-title">
                <div className="container">
                    <div className="home-cta">
                        <div>
                            <p className="kynex-eyebrow">TU PRÓXIMO PASO</p>
                            <h2 id="home-cta-title">Construye tu próximo nivel</h2>
                            <p>
                                Conoce el catálogo KYNEX y elige los productos que
                                acompañarán tu próxima sesión.
                            </p>
                        </div>
                        <div className="home-actions">
                            <Link className="btn home-primary-link" to="/productos">
                                Ir a la tienda
                                <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default HomePage;
