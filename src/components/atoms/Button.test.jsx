/*
 * Pruebas automatizadas.
 * Pruebas de Button. Casos: «renderiza el texto recibido mediante props»; «ejecuta onClick cuando el
 * usuario presiona el botón».
 */

import {
    describe,
    expect,
    it,
    vi
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import Button from "./Button.jsx";

describe("Button", () => {
    it("renderiza el texto recibido mediante props", () => {
        render(
            <Button>
                Agregar al carrito
            </Button>
        );

        expect(
            screen.getByRole(
                "button",
                {
                    name: /agregar al carrito/i
                }
            )
        ).toBeInTheDocument();
    });

    it("ejecuta onClick cuando el usuario presiona el botón", async () => {
        const user =
            userEvent.setup();

        const handleClick =
            vi.fn();

        render(
            <Button
                onClick={handleClick}
            >
                Comprar
            </Button>
        );

        await user.click(
            screen.getByRole(
                "button",
                {
                    name: /comprar/i
                }
            )
        );

        expect(
            handleClick
        ).toHaveBeenCalledTimes(1);
    });
});
