/*
 * Pruebas automatizadas.
 * Pruebas de Badge. Casos: «muestra el contenido recibido mediante children».
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

import Badge from "./Badge.jsx";

describe("Badge", () => {
    it("muestra el contenido recibido mediante children", () => {
        render(
            <Badge>
                Proteínas
            </Badge>
        );

        expect(
            screen.getByText(
                "Proteínas"
            )
        ).toBeInTheDocument();
    });
});
