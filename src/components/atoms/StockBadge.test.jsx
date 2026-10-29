/*
 * Pruebas automatizadas.
 * Pruebas de StockBadge. Casos: «muestra Disponible cuando el stock supera el nivel crítico»;
 * «muestra Stock crítico cuando el stock es menor o igual al nivel crítico».
 */

import {
    describe,
    expect,
    it
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import StockBadge from "./StockBadge.jsx";

describe("StockBadge", () => {
    it("muestra Disponible cuando el stock supera el nivel crítico", () => {
        render(
            <StockBadge
                stock={18}
                criticalStock={5}
            />
        );

        expect(
            screen.getByText(
                "Disponible"
            )
        ).toBeInTheDocument();
    });

    it("muestra Stock crítico cuando el stock es menor o igual al nivel crítico", () => {
        render(
            <StockBadge
                stock={3}
                criticalStock={5}
            />
        );

        expect(
            screen.getByText(
                "Stock crítico"
            )
        ).toBeInTheDocument();
    });

    it("muestra Sin stock cuando no quedan unidades", () => {
        render(
            <StockBadge
                stock={0}
                criticalStock={5}
            />
        );

        expect(
            screen.getByText(
                "Sin stock"
            )
        ).toBeInTheDocument();
    });
});
