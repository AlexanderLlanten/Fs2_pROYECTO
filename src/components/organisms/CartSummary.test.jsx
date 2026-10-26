import {
    describe,
    expect,
    it
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import CartSummary from "./CartSummary.jsx";

describe("CartSummary", () => {
    it("informa despacho gratuito cuando corresponde", () => {
        render(
            <CartSummary
                totalItems={2}
                subtotal={79980}
                shipping={0}
                total={79980}
                missingForFreeShipping={0}
            />
        );

        expect(
            screen.getByText(
                "Tu compra obtiene despacho gratuito."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Gratis"
            )
        ).toBeInTheDocument();
    });
});
