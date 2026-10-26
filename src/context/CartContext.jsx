import {
    createContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    products
} from "../data/products.js";

import {
    CART_KEY,
    calculateCartSummary,
    normalizeQuantity
} from "../utils/cart.js";

export const CartContext =
    createContext(null);

function readStoredCart() {
    const stored =
        localStorage.getItem(
            CART_KEY
        );

    if (!stored) {
        return [];
    }

    try {
        const parsed =
            JSON.parse(
                stored
            );

        return Array.isArray(
            parsed
        )
            ? parsed
            : [];
    } catch {
        return [];
    }
}

function CartProvider({
    children
}) {
    const [
        cart,
        setCart
    ] = useState(
        readStoredCart
    );

    useEffect(
        () => {
            localStorage.setItem(
                CART_KEY,
                JSON.stringify(
                    cart
                )
            );
        },
        [
            cart
        ]
    );

    const detailedCart =
        useMemo(
            () =>
                cart
                    .map(
                        cartItem => {
                            const product =
                                products.find(
                                    item =>
                                        item.id ===
                                        cartItem.id
                                );

                            if (!product) {
                                return null;
                            }

                            const quantity =
                                normalizeQuantity(
                                    cartItem.quantity,
                                    product.stock
                                );

                            if (
                                quantity === 0
                            ) {
                                return null;
                            }

                            return {
                                ...product,
                                quantity
                            };
                        }
                    )
                    .filter(Boolean),
            [
                cart
            ]
        );

    const summary =
        useMemo(
            () =>
                calculateCartSummary(
                    detailedCart
                ),
            [
                detailedCart
            ]
        );

    function addToCart(
        product,
        quantity = 1
    ) {
        if (
            !product
            ||
            Number(product.stock) <= 0
        ) {
            return;
        }

        setCart(
            currentCart => {
                const existing =
                    currentCart.find(
                        item =>
                            item.id ===
                            product.id
                    );

                if (!existing) {
                    return [
                        ...currentCart,
                        {
                            id:
                                product.id,

                            quantity:
                                normalizeQuantity(
                                    quantity,
                                    product.stock
                                )
                        }
                    ];
                }

                return currentCart.map(
                    item =>
                        item.id ===
                        product.id
                            ? {
                                ...item,

                                quantity:
                                    normalizeQuantity(
                                        item.quantity
                                        +
                                        quantity,
                                        product.stock
                                    )
                            }
                            : item
                );
            }
        );
    }

    function increaseQuantity(
        productId
    ) {
        const product =
            products.find(
                item =>
                    item.id ===
                    productId
            );

        if (!product) {
            return;
        }

        setCart(
            currentCart =>
                currentCart.map(
                    item =>
                        item.id ===
                        productId
                            ? {
                                ...item,

                                quantity:
                                    normalizeQuantity(
                                        item.quantity
                                        +
                                        1,
                                        product.stock
                                    )
                            }
                            : item
                )
        );
    }

    function decreaseQuantity(
        productId
    ) {
        setCart(
            currentCart =>
                currentCart
                    .map(
                        item =>
                            item.id ===
                            productId
                                ? {
                                    ...item,

                                    quantity:
                                        item.quantity
                                        -
                                        1
                                }
                                : item
                    )
                    .filter(
                        item =>
                            item.quantity >
                            0
                    )
        );
    }

    function removeFromCart(
        productId
    ) {
        setCart(
            currentCart =>
                currentCart.filter(
                    item =>
                        item.id !==
                        productId
                )
        );
    }

    function clearCart() {
        setCart(
            []
        );
    }

    const value = {
        cart,
        detailedCart,
        ...summary,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart
    };

    return (
        <CartContext.Provider
            value={value}
        >
            {children}
        </CartContext.Provider>
    );
}

export default CartProvider;
