"use strict";

/* =========================================================
   KYNEX - JAVASCRIPT GLOBAL
========================================================= */


/**
 * Inicialización global de KYNEX.
 */
document.addEventListener("DOMContentLoaded", () => {

    setCurrentYear();

    initializeCartCounter();

});


/* =========================================================
   AÑO ACTUAL
========================================================= */

/**
 * Inserta automáticamente el año actual en el footer.
 */
function setCurrentYear() {

    const yearElement =
        document.getElementById("current-year");

    if (!yearElement) {
        return;
    }

    const currentYear =
        new Date().getFullYear();

    yearElement.textContent =
        currentYear;

}


/* =========================================================
   CARRITO
========================================================= */

/**
 * Recupera temporalmente el carrito almacenado en LocalStorage.
 *
 * En etapas posteriores esta lógica se moverá al módulo
 * específico cart.js.
 */
function getStoredCart() {

    const storedCart =
        localStorage.getItem("kynex_cart");

    if (!storedCart) {
        return [];
    }

    try {

        const cart =
            JSON.parse(storedCart);

        return Array.isArray(cart)
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


/**
 * Actualiza el indicador de productos del carrito
 * ubicado en el menú principal.
 */
function initializeCartCounter() {

    const counter =
        document.getElementById("cart-counter");

    if (!counter) {
        return;
    }

    const cart =
        getStoredCart();

    const totalItems =
        cart.reduce(
            (total, product) => {

                const quantity =
                    Number(product.quantity) || 0;

                return total + quantity;

            },
            0
        );

    counter.textContent =
        totalItems;

    counter.setAttribute(
        "aria-label",
        `${totalItems} productos en el carrito`
    );

}