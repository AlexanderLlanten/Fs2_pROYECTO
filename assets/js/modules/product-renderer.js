"use strict";

/* =========================================================
   KYNEX - RENDERIZADO DEL CATÁLOGO
========================================================= */

import {
    getProducts
} from "./product-storage.js";


import {
    getProductImage
} from "./image-config.js";


/* =========================================================
   DATOS
========================================================= */

let products =
    getProducts();


/* =========================================================
   DOM
========================================================= */

const productsContainer =
    document.getElementById(
        "products-container"
    );


const searchInput =
    document.getElementById(
        "product-search"
    );


const categoryFilter =
    document.getElementById(
        "category-filter"
    );


const catalogCount =
    document.getElementById(
        "catalog-count"
    );


const emptyState =
    document.getElementById(
        "catalog-empty"
    );


/* =========================================================
   PRECIO
========================================================= */

function formatPrice(
    price
) {

    return new Intl.NumberFormat(
        "es-CL",
        {
            style:
                "currency",

            currency:
                "CLP",

            maximumFractionDigits:
                0
        }
    ).format(
        Number(price) || 0
    );

}


/* =========================================================
   IMAGEN
========================================================= */

function createProductVisual(
    product
) {

    const image =
        getProductImage(
            product
        );


    if (image) {

        return `
            <img
                src="${image}"
                alt="${product.name}"
                class="shop-product-image"
                loading="lazy"
            >
        `;

    }


    const icon =
        product.icon
        ||
        "bi-box-seam";


    return `
        <div class="shop-product-fallback">

            <i
                class="bi ${icon}"
                aria-hidden="true"
            ></i>

        </div>
    `;

}


/* =========================================================
   TARJETA
========================================================= */

function createProductCard(
    product
) {

    const goals =
        Array.isArray(
            product.goals
        )
            ? product.goals
                .slice(
                    0,
                    2
                )
                .map(
                    goal =>
                        `
                            <span class="product-tag">
                                ${goal}
                            </span>
                        `
                )
                .join("")
            : "";


    const description =
        product.description
        ||
        "Producto disponible en KYNEX.";


    const format =
        product.format
        ||
        "Sin especificar";


    return `
        <div class="col-md-6 col-xl-4">

            <article class="shop-product-card">

                <div class="shop-product-visual">

                    <span
                        class="
                            stock-badge
                            ${
                                Number(
                                    product.stock
                                ) <= 0
                                    ? "out-of-stock"
                                    : ""
                            }
                        "
                    >

                        ${
                            Number(
                                product.stock
                            ) > 0
                                ? "Disponible"
                                : "Sin stock"
                        }

                    </span>


                    ${createProductVisual(
                        product
                    )}

                </div>


                <div class="shop-product-body">

                    <div class="shop-product-meta">

                        <span>
                            ${product.category}
                        </span>

                        <span>
                            ${format}
                        </span>

                    </div>


                    <h2>
                        ${product.name}
                    </h2>


                    <p>
                        ${description}
                    </p>


                    <div class="product-tags">

                        ${goals}

                    </div>


                    <div class="shop-product-bottom">

                        <div>

                            <small>
                                Precio
                            </small>

                            <strong>
                                ${formatPrice(
                                    product.price
                                )}
                            </strong>

                        </div>


                        <a
                            href="product-detail.html?id=${product.id}"
                            class="btn btn-kynex-primary"
                            aria-label="Ver ${product.name}"
                        >

                            Ver producto

                        </a>

                    </div>

                </div>

            </article>

        </div>
    `;

}


/* =========================================================
   ESTADO CATÁLOGO
========================================================= */

function updateCatalogState(
    productList
) {

    const quantity =
        productList.length;


    if (
        catalogCount
    ) {

        catalogCount.textContent =
            quantity === 1
                ? "1 producto encontrado"
                : `${quantity} productos encontrados`;

    }


    if (
        emptyState
    ) {

        emptyState.classList.toggle(
            "d-none",
            quantity !== 0
        );

    }

}


/* =========================================================
   RENDER
========================================================= */

function renderProducts(
    productList
) {

    if (
        !productsContainer
    ) {

        return;

    }


    productsContainer.innerHTML =
        productList
            .map(
                createProductCard
            )
            .join("");


    updateCatalogState(
        productList
    );

}


/* =========================================================
   FILTROS
========================================================= */

function applyFilters() {

    products =
        getProducts();


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const filteredProducts =
        products.filter(
            product => {

                const name =
                    product.name
                        ?.toLowerCase()
                    ||
                    "";


                const description =
                    product.description
                        ?.toLowerCase()
                    ||
                    "";


                const category =
                    product.category
                        ?.toLowerCase()
                    ||
                    "";


                const code =
                    product.code
                        ?.toLowerCase()
                    ||
                    "";


                const matchesSearch =
                    name.includes(
                        searchTerm
                    )
                    ||
                    description.includes(
                        searchTerm
                    )
                    ||
                    category.includes(
                        searchTerm
                    )
                    ||
                    code.includes(
                        searchTerm
                    );


                const matchesCategory =
                    selectedCategory ===
                        "all"
                    ||
                    product.category ===
                        selectedCategory;


                return (
                    matchesSearch
                    &&
                    matchesCategory
                );

            }
        );


    renderProducts(
        filteredProducts
    );

}


/* =========================================================
   EVENTOS
========================================================= */

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


if (
    categoryFilter
) {

    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

renderProducts(
    products
);