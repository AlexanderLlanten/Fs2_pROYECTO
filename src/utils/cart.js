export const CART_KEY =
    "kynex_cart";

export const FREE_SHIPPING_FROM =
    50000;

export const STANDARD_SHIPPING =
    3990;

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

export function calculateCartSummary(
    detailedCart
) {
    const items =
        Array.isArray(
            detailedCart
        )
            ? detailedCart
            : [];

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
