/*
 * Organismo de interfaz.
 * Organiza las tarjetas del catálogo, transmite el evento de agregar y presenta el estado sin
 * productos cuando corresponde.
 */

import ProductCard from "../molecules/ProductCard.jsx";

function ProductGrid({
    products,
    onAddToCart,
    headingLevel = 2
}) {
    // Antes de recorrer products con map se comprueba que sea una lista con elementos; de lo
    // contrario se presenta el estado vacío.
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
                            headingLevel={headingLevel}
                        />
                    </div>
                )
            )}
        </div>
    );
}

export default ProductGrid;
