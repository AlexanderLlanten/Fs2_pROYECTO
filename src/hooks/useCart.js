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

    if (!context) {
        throw new Error(
            "useCart debe utilizarse dentro de CartProvider."
        );
    }

    return context;
}

export default useCart;
