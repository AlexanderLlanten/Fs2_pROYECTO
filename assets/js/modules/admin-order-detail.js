"use strict";

/* =========================================================
   KYNEX - DETALLE DE PEDIDO
========================================================= */

import {
    orders
} from "../data/orders.js";


const params =
    new URLSearchParams(
        window.location.search
    );


const orderId =
    Number(
        params.get("id")
    );


const order =
    orders.find(
        item =>
            item.id === orderId
    );


const detailContainer =
    document.getElementById(
        "order-detail"
    );


const notFound =
    document.getElementById(
        "order-not-found"
    );


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
   RENDER
========================================================= */

function renderOrder() {

    if (!order) {

        detailContainer.classList.add(
            "d-none"
        );

        notFound.classList.remove(
            "d-none"
        );

        return;

    }


    document.getElementById(
        "order-title"
    ).textContent =
        `Pedido #${order.id}`;


    const productsHtml =
        order.products
            .map(
                product => {

                    const total =
                        product.price
                        *
                        product.quantity;


                    return `
                        <tr>

                            <td>
                                ${product.name}
                            </td>

                            <td>
                                ${formatPrice(product.price)}
                            </td>

                            <td>
                                ${product.quantity}
                            </td>

                            <td>
                                ${formatPrice(total)}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    const orderTotal =
        order.products.reduce(
            (total, product) =>
                total
                +
                (
                    product.price
                    *
                    product.quantity
                ),
            0
        );


    detailContainer.innerHTML =
        `
            <div class="admin-toolbar">

                <div>

                    <p class="section-eyebrow">
                        CLIENTE
                    </p>

                    <h2>
                        ${order.customer.name}
                    </h2>

                    <p>
                        ${order.customer.email}
                    </p>

                </div>


                <span class="role-badge">
                    ${order.status}
                </span>

            </div>


            <div class="admin-table-wrapper">

                <table class="admin-table">

                    <thead>

                        <tr>

                            <th>
                                Producto
                            </th>

                            <th>
                                Precio
                            </th>

                            <th>
                                Cantidad
                            </th>

                            <th>
                                Total
                            </th>

                        </tr>

                    </thead>


                    <tbody>
                        ${productsHtml}
                    </tbody>

                </table>

            </div>


            <div class="mt-4">

                <h3>
                    Total:
                    ${formatPrice(orderTotal)}
                </h3>

                <p>
                    Fecha:
                    ${order.date}
                </p>

            </div>
        `;

}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

renderOrder();