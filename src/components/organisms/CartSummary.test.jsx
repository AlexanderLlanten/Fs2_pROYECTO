/*
 * Pruebas automatizadas.
 * Pruebas de CartSummary. Casos: «anuncia el alcance demostrativo al activar Continuar compra con
 * teclado»; «deshabilita la continuación de un carrito vacío».
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

import CartSummary from "./CartSummary.jsx";
import userEvent from "@testing-library/user-event";

describe("CartSummary", () => {
    it("anuncia el alcance demostrativo al activar Continuar compra con teclado", async () => {
        const user = userEvent.setup();
        render(<CartSummary totalItems={1} subtotal={21990} shipping={3990} total={25980} missingForFreeShipping={28010} />);
        const button = screen.getByRole("button", { name: "Continuar compra" });
        expect(screen.getByRole("status")).toBeEmptyDOMElement();
        await user.tab(); expect(button).toHaveFocus(); await user.keyboard("{Enter}");
        expect(screen.getByRole("status")).toHaveTextContent("El proceso de checkout será implementado en una etapa posterior.");
        expect(button).toHaveAccessibleDescription("El proceso de checkout será implementado en una etapa posterior.");
        expect(button).toHaveFocus();
        await user.click(button);
        expect(screen.getAllByRole("status")).toHaveLength(1);
    });

    it("deshabilita la continuación de un carrito vacío", async () => {
        const user = userEvent.setup();
        render(<CartSummary totalItems={0} subtotal={0} shipping={0} total={0} missingForFreeShipping={0} />);
        const button = screen.getByRole("button", { name: "Continuar compra" });
        expect(button).toBeDisabled(); await user.click(button);
        expect(screen.getByRole("status")).toBeEmptyDOMElement();
        expect(screen.getByText("Agrega productos para calcular el despacho.")).toBeInTheDocument();
    });
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
