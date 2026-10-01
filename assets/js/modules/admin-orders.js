"use strict";

/* =========================================================
   KYNEX - LISTADO DE PEDIDOS
========================================================= */

import {
    orders
} from "../data/orders.js";


/* =========================================================
   DOM
========================================================= */

const tableBody =
    document.getElementById(
        "orders-table-body"
    );


/* =========================================================
   VALIDACIÓN INICIAL
========================================================= */

if (!tableBody) {

    console.error(
        "No se encontró el elemento #orders-table-body."
    );

}


/* =========================================================
   MONEDA
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
   TOTAL PEDIDO
========================================================= */

function calculateOrderTotal(order) {

    return order.products.reduce(
        (total, product) => {

            return total +
                (
                    product.price
                    *
                    product.quantity
                );

        },
        0
    );

}


/* =========================================================
   CANTIDAD TOTAL
========================================================= */

function calculateOrderQuantity(order) {

    return order.products.reduce(
        (total, product) =>
            total + product.quantity,
        0
    );

}


/* =========================================================
   FILA
========================================================= */

function createOrderRow(order) {

    const quantity =
        calculateOrderQuantity(order);


    const total =
        calculateOrderTotal(order);


    return `
        <tr>

            <td>
                #${order.id}
            </td>


            <td>
                ${order.date}
            </td>


            <td>

                <strong>
                    ${order.customer.name}
                </strong>

                <br>

                <small>
                    ${order.customer.email}
                </small>

            </td>


            <td>
                ${quantity}
            </td>


            <td>
                ${formatPrice(total)}
            </td>


            <td>

                <span class="role-badge">
                    ${order.status}
                </span>

            </td>


            <td>

                <a
                    href="order-detail.html?id=${order.id}"
                    class="admin-action-button"
                    aria-label="Ver pedido ${order.id}"
                >

                    <i class="bi bi-eye"></i>

                </a>

            </td>

        </tr>
    `;

}


/* =========================================================
   RENDER
========================================================= */

function renderOrders() {

    if (!tableBody) {
        return;
    }


    if (!Array.isArray(orders)) {

        console.error(
            "orders.js no está exportando un arreglo válido."
        );

        return;
    }


    if (orders.length === 0) {

        tableBody.innerHTML =
            `
                <tr>

                    <td
                        colspan="7"
                        style="text-align:center;"
                    >
                        No hay pedidos disponibles.
                    </td>

                </tr>
            `;

        return;
    }


    tableBody.innerHTML =
        orders
            .map(createOrderRow)
            .join("");

}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

renderOrders();