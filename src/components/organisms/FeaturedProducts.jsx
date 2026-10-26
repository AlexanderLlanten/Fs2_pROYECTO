import { Link } from "react-router-dom";

import SectionHeading from "../molecules/SectionHeading.jsx";
import ProductGrid from "./ProductGrid.jsx";

function FeaturedProducts({ products, onAddToCart, feedback = "" }) {
    const featuredProducts = products.filter(product => product.featured);

    if (featuredProducts.length === 0) {
        return null;
    }

    return (
        <section
            className="home-section home-section-soft"
            id="productos-destacados"
            aria-labelledby="featured-title"
        >
            <div className="container">
                <div className="home-section-top">
                    <SectionHeading
                        id="featured-title"
                        eyebrow="KYNEX STORE"
                        title="Productos destacados"
                        description="Una selección para acompañar tu fuerza, rendimiento y recuperación."
                    />
                    <Link className="btn btn-outline-light" to="/productos">
                        Ver todo el catálogo
                    </Link>
                </div>
                <p className="home-feedback" role="status" aria-live="polite" aria-atomic="true">
                    {feedback}
                </p>
                <ProductGrid
                    products={featuredProducts}
                    onAddToCart={onAddToCart}
                    headingLevel={3}
                />
            </div>
        </section>
    );
}

export default FeaturedProducts;
