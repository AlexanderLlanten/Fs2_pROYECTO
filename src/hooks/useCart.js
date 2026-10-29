/*
 * Hook reutilizable de React.
 * Accede a CartContext y exige estar dentro de CartProvider. Evita repetir useContext y su
 * comprobación en cada consumidor.
 */

import {
    useContext
} from "react";

import {
    CartContext
} from "../context/CartContext.jsx";

function useCart() {
    const context =
        useContext(
            CartContext
        );

    // Todos los consumidores deben estar dentro del mismo CartProvider; el hook consulta ese carrito
    // compartido, no crea otro.
    if (!context) {
        throw new Error(
            "useCart debe utilizarse dentro de CartProvider."
        );
    }

    return context;
}

export default useCart;
