"use strict";

/* =========================================================
   KYNEX - ADMINISTRACIÓN DE PRODUCTOS
========================================================= */

import {
    getProducts,
    saveProducts
} from "./product-storage.js";


import {
    getSession
} from "./auth.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const tableBody =
    document.getElementById(
        "products-table-body"
    );


const emptyState =
    document.getElementById(
        "products-empty"
    );


const session =
    getSession();


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


/* =========================================================
   PERMISOS
========================================================= */

function isAdministrator() {

    return (
        session?.role ===
        "Administrador"
    );

}


/* =========================================================
   CREAR FILA
========================================================= */

function createProductRow(product) {

    const critical =
        product.criticalStock !== null
        &&
        product.criticalStock !== undefined
        &&
        product.stock <=
            product.criticalStock;


    const adminActions =
        isAdministrator()
            ? `
                <a
                    href="product-form.html?id=${product.id}"
                    class="admin-action-button"
                    aria-label="Editar ${product.name}"
                    title="Editar producto"
                >
                    <i class="bi bi-pencil"></i>
                </a>


                <button
                    type="button"
                    class="
                        admin-action-button
                        delete
                        product-delete
                    "
                    data-product-id="${product.id}"
                    aria-label="Eliminar ${product.name}"
                    title="Eliminar producto"
                >
                    <i class="bi bi-trash"></i>
                </button>
            `
            : "";


    return `
        <tr>

            <td>
                ${product.code || "-"}
            </td>


            <td>
                ${product.name}
            </td>


            <td>
                ${product.category}
            </td>


            <td>
                ${formatPrice(
                    product.price
                )}
            </td>


            <td>

                <span
                    class="
                        ${
                            critical
                                ? "stock-critical"
                                : ""
                        }
                    "
                >
                    ${product.stock}
                </span>

            </td>


            <td>
                ${
                    product.criticalStock
                    ?? "-"
                }
            </td>


            <td>

                ${
                    critical
                        ? `
                            <span class="stock-alert">
                                Stock crítico
                            </span>
                        `
                        : `
                            <span class="role-badge">
                                Disponible
                            </span>
                        `
                }

            </td>


            <td>

                <div class="admin-actions">

                    <a
                        href="../../pages/shop/product-detail.html?id=${product.id}"
                        class="admin-action-button"
                        aria-label="Ver ${product.name}"
                        title="Ver detalle"
                    >
                        <i class="bi bi-eye"></i>
                    </a>


                    ${adminActions}

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   RENDER
========================================================= */

function renderProducts() {

    const products =
        getProducts();


    if (
        products.length === 0
    ) {

        tableBody.innerHTML =
            "";


        emptyState
            .classList.remove(
                "d-none"
            );


        return;

    }


    emptyState
        .classList.add(
            "d-none"
        );


    tableBody.innerHTML =
        products
            .map(
                createProductRow
            )
            .join("");

}


/* =========================================================
   ELIMINAR PRODUCTO
========================================================= */

function deleteProduct(
    productId
) {

    /*
     * Seguridad demostrativa Front End.
     * Solo el Administrador puede ejecutar
     * esta operación desde la interfaz.
     */

    if (
        !isAdministrator()
    ) {

        return;

    }


    const products =
        getProducts();


    const updatedProducts =
        products.filter(
            product =>
                product.id !==
                productId
        );


    saveProducts(
        updatedProducts
    );


    renderProducts();

}


/* =========================================================
   EVENT DELEGATION
========================================================= */

tableBody.addEventListener(
    "click",
    event => {

        const deleteButton =
            event.target.closest(
                ".product-delete"
            );


        if (!deleteButton) {

            return;

        }


        if (
            !isAdministrator()
        ) {

            return;

        }


        const productId =
            Number(
                deleteButton.dataset.productId
            );


        const confirmed =
            window.confirm(
                "¿Deseas eliminar este producto?"
            );


        if (
            confirmed
        ) {

            deleteProduct(
                productId
            );

        }

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

renderProducts();