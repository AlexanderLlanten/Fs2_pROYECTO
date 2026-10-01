"use strict";

import {
    products as defaultProducts
} from "../data/products.js";


const PRODUCTS_KEY =
    "kynex_products";


export function getProducts() {

    const stored =
        localStorage.getItem(
            PRODUCTS_KEY
        );


    if (!stored) {

        localStorage.setItem(
            PRODUCTS_KEY,
            JSON.stringify(defaultProducts)
        );

        return [
            ...defaultProducts
        ];

    }


    try {

        const parsed =
            JSON.parse(stored);


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "No fue posible leer los productos.",
            error
        );


        return [
            ...defaultProducts
        ];

    }

}


export function saveProducts(products) {

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );

}


export function getProductById(id) {

    return getProducts().find(
        product =>
            product.id === Number(id)
    );

}