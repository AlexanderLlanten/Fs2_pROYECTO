"use strict";

/* =========================================================
   KYNEX - DETALLE DE PRODUCTO
========================================================= */

import {
    getProductById
} from "./product-storage.js";

import {
    getProductImage
} from "./image-config.js";


/* =========================================================
   OBTENER PRODUCTO DESDE URL
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const productId =
    Number(
        params.get("id")
    );


const product =
    getProductById(
        productId
    );


/* =========================================================
   REFERENCIAS DEL DOM
========================================================= */

const detailContainer =
    document.getElementById(
        "product-detail-container"
    );


const informationContainer =
    document.getElementById(
        "product-information"
    );


const notFoundContainer =
    document.getElementById(
        "product-not-found"
    );


const breadcrumbProduct =
    document.getElementById(
        "breadcrumb-product"
    );


/* =========================================================
   UTILIDADES
========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat(
        "es-CL",
        {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }
    ).format(price);

}


function createList(items) {

    if (
        !Array.isArray(items)
        ||
        items.length === 0
    ) {

        return `
            <li>
                No especificado
            </li>
        `;

    }


    return items
        .map(
            item =>
                `<li>${item}</li>`
        )
        .join("");

}


/* =========================================================
   PRODUCTO NO ENCONTRADO
========================================================= */

function showProductNotFound() {

    detailContainer
        ?.classList.add(
            "d-none"
        );


    informationContainer
        ?.classList.add(
            "d-none"
        );


    document
        .querySelector(
            ".nutrition-section"
        )
        ?.classList.add(
            "d-none"
        );


    document
        .querySelector(
            ".product-safety"
        )
        ?.classList.add(
            "d-none"
        );


    notFoundContainer
        ?.classList.remove(
            "d-none"
        );

}


/* =========================================================
   RENDER PRINCIPAL
========================================================= */

function renderProduct(product) {

    document.title =
        `${product.name} | KYNEX`;


    if (breadcrumbProduct) {

        breadcrumbProduct.textContent =
            product.name;

    }


    /* =====================================================
       DATOS BÁSICOS
    ===================================================== */

    document.getElementById(
        "product-category"
    ).textContent =
        product.category
        ||
        "Sin categoría";


    document.getElementById(
        "product-brand"
    ).textContent =
        product.brand
        ||
        "KYNEX Nutrition";


    document.getElementById(
        "product-name"
    ).textContent =
        product.name
        ||
        "Producto";


    document.getElementById(
        "product-description"
    ).textContent =
        product.description
        ||
        "Sin descripción disponible.";


    document.getElementById(
        "product-price"
    ).textContent =
        formatPrice(
            Number(product.price) || 0
        );


    document.getElementById(
        "product-format"
    ).textContent =
        product.format
        ||
        "Sin especificar";


    document.getElementById(
        "product-flavor"
    ).textContent =
        product.flavor
        ||
        "Sin especificar";


    document.getElementById(
        "product-stock"
    ).textContent =
        `${Number(product.stock) || 0} unidades disponibles`;


    /* =====================================================
    IMAGEN
    ===================================================== */

    const productImage =
        document.getElementById(
            "product-image"
        );


    const imageFallback =
        document.getElementById(
            "product-image-fallback"
        );


    const icon =
        document.getElementById(
            "product-icon"
        );


    const imageUrl =
        getProductImage(
            product
        );


    if (
        imageUrl
    ) {

        productImage.src =
            imageUrl;


        productImage.alt =
            `${product.name} - ${product.brand || "KYNEX"}`;


        productImage.classList.remove(
            "d-none"
        );


        imageFallback.classList.add(
            "d-none"
        );


        /*
        * En caso de ruta rota,
        * vuelve al icono.
        */

        productImage.onerror =
            () => {

                productImage.classList.add(
                    "d-none"
                );


                imageFallback.classList.remove(
                    "d-none"
                );

            };

    } else {

        productImage.classList.add(
            "d-none"
        );


        imageFallback.classList.remove(
            "d-none"
        );


        if (
            icon
        ) {

            icon.className =
                `bi ${
                    product.icon
                    ||
                    "bi-box-seam"
                }`;

        }

    }


    /* =====================================================
       STOCK
    ===================================================== */

    const stockBadge =
        document.getElementById(
            "product-stock-badge"
        );


    const addButton =
        document.getElementById(
            "add-to-cart"
        );


    if (
        Number(product.stock) > 0
    ) {

        stockBadge.textContent =
            "Disponible";


        if (addButton) {

            addButton.disabled =
                false;

        }

    } else {

        stockBadge.textContent =
            "Sin stock";


        if (addButton) {

            addButton.disabled =
                true;

        }

    }


    /* =====================================================
       OBJETIVOS
    ===================================================== */

    const goals =
        Array.isArray(
            product.goals
        )
            ? product.goals
            : [];


    document.getElementById(
        "product-tags"
    ).innerHTML =
        goals.length > 0
            ? goals
                .map(
                    goal =>
                        `
                            <span class="product-tag">
                                ${goal}
                            </span>
                        `
                )
                .join("")
            : `
                <span class="product-tag">
                    Sin objetivo definido
                </span>
            `;


    /* =====================================================
       BENEFICIOS
    ===================================================== */

    document.getElementById(
        "product-benefits"
    ).innerHTML =
        createList(
            product.benefits
        );


    /* =====================================================
       INGREDIENTES
    ===================================================== */

    document.getElementById(
        "product-ingredients"
    ).innerHTML =
        createList(
            product.ingredients
        );


    /* =====================================================
       ALÉRGENOS
    ===================================================== */

    const allergens =
        document.getElementById(
            "product-allergens"
        );


    const productAllergens =
        Array.isArray(
            product.allergens
        )
            ? product.allergens
            : [];


    if (
        productAllergens.length === 0
    ) {

        allergens.innerHTML =
            `
                <p class="allergen-safe">
                    No se informan alérgenos.
                </p>
            `;

    } else {

        allergens.innerHTML =
            `
                <ul>
                    ${createList(
                        productAllergens
                    )}
                </ul>
            `;

    }


    /* =====================================================
       USO
    ===================================================== */

    const usage =
        product.usage
        &&
        typeof product.usage ===
            "object"
            ? product.usage
            : {};


    document.getElementById(
        "product-serving"
    ).textContent =
        usage.serving
        ||
        "No especificado";


    document.getElementById(
        "product-preparation"
    ).textContent =
        usage.preparation
        ||
        "No especificado";


    document.getElementById(
        "product-moment"
    ).textContent =
        usage.moment
        ||
        "No especificado";


    /* =====================================================
       NUTRICIÓN
    ===================================================== */

    const nutrition =
        product.nutrition
        &&
        typeof product.nutrition ===
            "object"
            ? product.nutrition
            : {};


    document.getElementById(
        "nutrition-serving"
    ).textContent =
        nutrition.servingSize
        ||
        "No especificado";


    document.getElementById(
        "nutrition-calories"
    ).textContent =
        nutrition.calories !== undefined
        &&
        nutrition.calories !== null
            ? `${nutrition.calories} kcal`
            : "No especificado";


    document.getElementById(
        "nutrition-protein"
    ).textContent =
        nutrition.protein
        ||
        "No especificado";


    document.getElementById(
        "nutrition-carbohydrates"
    ).textContent =
        nutrition.carbohydrates
        ||
        "No especificado";


    document.getElementById(
        "nutrition-fats"
    ).textContent =
        nutrition.fats
        ||
        "No especificado";


    /* =====================================================
       CERTIFICACIONES
    ===================================================== */

    const certifications =
        Array.isArray(
            product.certifications
        )
            ? product.certifications
            : [];


    document.getElementById(
        "product-certifications"
    ).innerHTML =
        certifications.length > 0
            ? certifications
                .map(
                    certification =>
                        `
                            <span class="certification-badge">

                                <i class="bi bi-patch-check"></i>

                                ${certification}

                            </span>
                        `
                )
                .join("")
            : `
                <span class="certification-badge">
                    Sin certificaciones registradas
                </span>
            `;


    /* =====================================================
       ADVERTENCIA
    ===================================================== */

    document.getElementById(
        "product-warning"
    ).textContent =
        product.warning
        ||
        "Producto demostrativo. Revisar indicaciones antes de utilizar.";

}


/* =========================================================
   CANTIDAD
========================================================= */

function initializeQuantity() {

    const input =
        document.getElementById(
            "product-quantity"
        );


    const minus =
        document.getElementById(
            "quantity-minus"
        );


    const plus =
        document.getElementById(
            "quantity-plus"
        );


    if (
        !input
        ||
        !minus
        ||
        !plus
    ) {

        return;

    }


    input.value =
        1;


    minus.addEventListener(
        "click",
        () => {

            const value =
                Number(
                    input.value
                );


            if (
                value > 1
            ) {

                input.value =
                    value - 1;

            }

        }
    );


    plus.addEventListener(
        "click",
        () => {

            const value =
                Number(
                    input.value
                );


            const maximum =
                Math.min(
                    Number(
                        product.stock
                    ) || 0,
                    10
                );


            if (
                value < maximum
            ) {

                input.value =
                    value + 1;

            }

        }
    );

}


/* =========================================================
   LOCAL STORAGE - CARRITO
========================================================= */

function getStoredCart() {

    const storedCart =
        localStorage.getItem(
            "kynex_cart"
        );


    if (!storedCart) {

        return [];

    }


    try {

        const cart =
            JSON.parse(
                storedCart
            );


        return Array.isArray(
            cart
        )
            ? cart
            : [];

    } catch (error) {

        console.error(
            "No fue posible leer el carrito almacenado.",
            error
        );


        return [];

    }

}


/* =========================================================
   AGREGAR AL CARRITO
========================================================= */

function addProductToCart() {

    const quantity =
        Number(
            document.getElementById(
                "product-quantity"
            ).value
        );


    const storedCart =
        getStoredCart();


    const existingProduct =
        storedCart.find(
            item =>
                item.id ===
                product.id
        );


    const availableStock =
        Number(
            product.stock
        ) || 0;


    if (
        availableStock <= 0
    ) {

        return;

    }


    if (
        existingProduct
    ) {

        existingProduct.quantity =
            Math.min(
                existingProduct.quantity
                +
                quantity,
                availableStock
            );

    } else {

        storedCart.push(
            {
                id:
                    product.id,

                name:
                    product.name,

                price:
                    product.price,

                quantity:
                    Math.min(
                        quantity,
                        availableStock
                    )
            }
        );

    }


    localStorage.setItem(
        "kynex_cart",
        JSON.stringify(
            storedCart
        )
    );


    showCartFeedback(
        quantity
    );


    updateNavbarCartCounter();

}


/* =========================================================
   FEEDBACK
========================================================= */

function showCartFeedback(
    quantity
) {

    const feedback =
        document.getElementById(
            "cart-feedback"
        );


    if (!feedback) {

        return;

    }


    feedback.textContent =
        quantity === 1
            ? "Producto agregado al carrito."
            : `${quantity} productos agregados al carrito.`;

}


/* =========================================================
   CONTADOR NAVBAR
========================================================= */

function updateNavbarCartCounter() {

    const counter =
        document.getElementById(
            "cart-counter"
        );


    if (!counter) {

        return;

    }


    const cart =
        getStoredCart();


    const total =
        cart.reduce(
            (sum, item) =>
                sum
                +
                Number(
                    item.quantity
                ),
            0
        );


    counter.textContent =
        total;


    counter.setAttribute(
        "aria-label",
        `${total} productos en el carrito`
    );

}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

if (!product) {

    showProductNotFound();

} else {

    renderProduct(
        product
    );


    initializeQuantity();


    const addToCartButton =
        document.getElementById(
            "add-to-cart"
        );


    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            addProductToCart
        );

    }

}