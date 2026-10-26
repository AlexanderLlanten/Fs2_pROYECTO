import {
    useState
} from "react";

import ProductGrid from "../components/organisms/ProductGrid.jsx";

import {
    products
} from "../data/products.js";

function ProductsPage() {
    const [
        search,
        setSearch
    ] = useState("");

    const [
        category,
        setCategory
    ] = useState("all");

    const categories = [
        ...new Set(
            products.map(
                product =>
                    product.category
            )
        )
    ];

    const normalizedSearch =
        search
            .trim()
            .toLowerCase();

    const filteredProducts =
        products.filter(
            product => {
                const matchesSearch =
                    normalizedSearch === ""
                    ||
                    product.name
                        .toLowerCase()
                        .includes(
                            normalizedSearch
                        )
                    ||
                    product.description
                        .toLowerCase()
                        .includes(
                            normalizedSearch
                        );

                const matchesCategory =
                    category === "all"
                    ||
                    product.category ===
                        category;

                return (
                    matchesSearch
                    &&
                    matchesCategory
                );
            }
        );

    return (
        <main>
            <section className="catalog-header">
                <div className="container">
                    <p className="kynex-eyebrow">
                        CATÁLOGO KYNEX
                    </p>

                    <h1>
                        Suplementación para cada objetivo
                    </h1>

                    <p>
                        Explora el catálogo disponible y filtra los productos
                        según tus necesidades.
                    </p>
                </div>
            </section>

            <section className="catalog-section">
                <div className="container">
                    <div className="catalog-toolbar">
                        <div className="catalog-search">
                            <label
                                className="visually-hidden"
                                htmlFor="product-search"
                            >
                                Buscar productos
                            </label>

                            <i
                                className="bi bi-search"
                                aria-hidden="true"
                            />

                            <input
                                id="product-search"
                                type="search"
                                value={search}
                                placeholder="Buscar productos..."
                                onChange={
                                    event =>
                                        setSearch(
                                            event.target.value
                                        )
                                }
                            />
                        </div>

                        <div className="catalog-filter">
                            <label
                                className="visually-hidden"
                                htmlFor="category-filter"
                            >
                                Filtrar por categoría
                            </label>

                            <select
                                id="category-filter"
                                value={category}
                                onChange={
                                    event =>
                                        setCategory(
                                            event.target.value
                                        )
                                }
                            >
                                <option value="all">
                                    Todas las categorías
                                </option>

                                {categories.map(
                                    item => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    <div
                        className="catalog-summary"
                        aria-live="polite"
                    >
                        <p>
                            {
                                filteredProducts.length
                            }
                            {
                                filteredProducts.length === 1
                                    ? " producto encontrado"
                                    : " productos encontrados"
                            }
                        </p>
                    </div>

                    <ProductGrid
                        products={filteredProducts}
                    />
                </div>
            </section>
        </main>
    );
}

export default ProductsPage;
