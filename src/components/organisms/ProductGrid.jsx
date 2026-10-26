import ProductCard from "../molecules/ProductCard.jsx";

function ProductGrid({
    products,
    onAddToCart
}) {
    if (
        !Array.isArray(products)
        ||
        products.length === 0
    ) {
        return (
            <div
                className="catalog-empty"
                role="status"
            >
                <i
                    className="bi bi-search"
                    aria-hidden="true"
                />

                <h2>
                    No encontramos productos
                </h2>

                <p>
                    Intenta cambiar la búsqueda o la categoría seleccionada.
                </p>
            </div>
        );
    }

    return (
        <div className="row g-4">
            {products.map(
                product => (
                    <div
                        className="col-12 col-md-6 col-xl-4"
                        key={product.id}
                    >
                        <ProductCard
                            product={product}
                            onAddToCart={onAddToCart}
                        />
                    </div>
                )
            )}
        </div>
    );
}

export default ProductGrid;
