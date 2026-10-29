/*
 * Página y coordinación de la vista.
 * Obtiene el catálogo compartido. Mantiene búsqueda local, sincroniza categoría con la URL y aplica
 * ambos criterios antes de presentar ProductGrid.
 */

import {
    useState
} from "react";
import { useSearchParams } from "react-router-dom";

import ProductGrid from "../components/organisms/ProductGrid.jsx";

import useCatalog from "../hooks/useCatalog.js";
import CatalogError from "../components/molecules/CatalogError.jsx";

import useCart from "../hooks/useCart.js";

function ProductsPage() {
    const catalog = useCatalog();
    const { products } = catalog;
    const {
        addToCart
    } = useCart();

    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [
        search,
        setSearch
    ] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    // Set elimina categorías repetidas para construir las opciones del selector a partir del catálogo
    // vigente.
    const categories = [
        ...new Set(
            products.map(
                product =>
                    product.category
            )
        )
    ];

    // La categoría vive en la URL para conservar enlaces y navegación del historial. Una categoría
    // desconocida equivale a mostrar todas.
    const requestedCategory = searchParams.get("categoria");
    const category = categories.includes(requestedCategory)
        ? requestedCategory
        : "all";

    // Actualiza la categoría del catálogo en los parámetros de consulta y conserva los demás
    // parámetros.
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

    // Un producto debe cumplir a la vez el texto buscado y la categoría seleccionada; el filtro crea
    // otra lista sin alterar el catálogo.
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
                        )
                    || product.category.toLowerCase().includes(normalizedSearch)
                    || product.code.toLowerCase().includes(normalizedSearch);

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

                    {!catalog.success ? <CatalogError resource={catalog} /> : <ProductGrid
                        products={filteredProducts}
                        onAddToCart={addToCart}
                    />}
                </div>
            </section>
        </>
    );
}

export default ProductsPage;
