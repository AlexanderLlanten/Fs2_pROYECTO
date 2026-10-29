/*
 * Reglas y funciones auxiliares.
 * Define la clave de compra y las reglas de despacho. Limita cantidades según stock y calcula
 * unidades, subtotal, envío, total y diferencia para despacho gratuito.
 */

export const CART_KEY =
    "kynex_cart";

export const FREE_SHIPPING_FROM =
    50000;

export const STANDARD_SHIPPING =
    3990;

// Convierte cantidades y stock a números y limita el resultado entre uno y el stock disponible;
// devuelve cero cuando el stock no permite compra.
export function normalizeQuantity(
    quantity,
    stock
) {
    const numericStock =
        Math.max(
            0,
            Number(stock) || 0
        );

    if (
        numericStock === 0
    ) {
        return 0;
    }

    const numericQuantity =
        Number(quantity) || 1;

    return Math.min(
        Math.max(
            numericQuantity,
            1
        ),
        numericStock
    );
}

// Devuelve unidades, subtotal, despacho, total y monto faltante para despacho gratuito a partir de
// las líneas detalladas.
export function calculateCartSummary(
    detailedCart
) {
    const items =
        Array.isArray(
            detailedCart
        )
            ? detailedCart
            : [];

    // reduce acumula las cantidades de todas las líneas; dos unidades del mismo producto cuentan como
    // dos.
    const totalItems =
        items.reduce(
            (
                total,
                product
            ) =>
                total
                +
                (
                    Number(
                        product.quantity
                    ) || 0
                ),
            0
        );

    // El subtotal suma precio por cantidad de cada producto antes de agregar el despacho.
    const subtotal =
        items.reduce(
            (
                total,
                product
            ) =>
                total
                +
                (
                    (
                        Number(
                            product.price
                        ) || 0
                    )
                    *
                    (
                        Number(
                            product.quantity
                        ) || 0
                    )
                ),
            0
        );

    // Se cobra despacho solo para un subtotal positivo inferior al umbral gratuito; el carrito vacío
    // tiene despacho cero.
    const shipping =
        subtotal > 0
        &&
        subtotal <
            FREE_SHIPPING_FROM
            ? STANDARD_SHIPPING
            : 0;

    const total =
        subtotal
        +
        shipping;

    const missingForFreeShipping =
        subtotal > 0
        &&
        subtotal <
            FREE_SHIPPING_FROM
            ? FREE_SHIPPING_FROM
                -
                subtotal
            : 0;

    return {
        totalItems,
        subtotal,
        shipping,
        total,
        missingForFreeShipping
    };
}
