import {
    useState
} from "react";
import { useSearchParams } from "react-router-dom";

import ProductGrid from "../components/organisms/ProductGrid.jsx";

import {
    products
} from "../data/products.js";

import useCart from "../hooks/useCart.js";

function ProductsPage() {
    const {
        addToCart
    } = useCart();

    const [
        search,
        setSearch
    ] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    const categories = [
        ...new Set(
            products.map(
                product =>
                    product.category
            )
        )
    ];

    const requestedCategory = searchParams.get("categoria");
    const category = categories.includes(requestedCategory)
        ? requestedCategory
        : "all";

    function handleCategoryChange(event) {
        const nextCategory = event.target.value;

        setSearchParams(currentParams => {
            const nextParams = new URLSearchParams(currentParams);

            if (nextCategory === "all") {
                nextParams.delete("categoria");
            } else {
                nextParams.set("categoria", nextCategory);
            }

            return nextParams;
        });
    }

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
        <>
            <section className="catalog-header">
                <div className="container">
                    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                        <div>
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
                    </div>
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
                                onChange={handleCategoryChange}
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
                        onAddToCart={addToCart}
                    />
                </div>
            </section>
        </>
    );
}

export default ProductsPage;
