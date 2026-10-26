import {
    describe,
    expect,
    it
} from "vitest";

import {
    calculateCartSummary,
    normalizeQuantity
} from "./cart.js";

describe("cart utils", () => {
    it("limita una cantidad al stock disponible", () => {
        expect(
            normalizeQuantity(
                20,
                5
            )
        ).toBe(
            5
        );
    });

    it("calcula despacho estándar cuando el subtotal es menor a $50.000", () => {
        const summary =
            calculateCartSummary([
                {
                    price: 21990,
                    quantity: 1
                }
            ]);

        expect(
            summary.shipping
        ).toBe(
            3990
        );

        expect(
            summary.total
        ).toBe(
            25980
        );
    });

    it("calcula despacho gratuito desde $50.000", () => {
        const summary =
            calculateCartSummary([
                {
                    price: 39990,
                    quantity: 2
                }
            ]);

        expect(
            summary.shipping
        ).toBe(
            0
        );

        expect(
            summary.total
        ).toBe(
            79980
        );
    });
});
