import {
    describe,
    expect,
    it
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import Price, {
    formatPrice
} from "./Price.jsx";

describe("Price", () => {
    it("formatea un valor numérico como moneda chilena", () => {
        expect(
            formatPrice(39990)
        ).toMatch(
            /39\.990/
        );
    });

    it("renderiza el precio recibido mediante props", () => {
        render(
            <Price
                value={21990}
            />
        );

        expect(
            screen.getByText(
                /21\.990/
            )
        ).toBeInTheDocument();
    });
});
