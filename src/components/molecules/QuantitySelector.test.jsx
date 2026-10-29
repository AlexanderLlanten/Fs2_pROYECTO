/*
 * Pruebas automatizadas.
 * Pruebas de QuantitySelector. Casos: «permite bloquear ambos límites sin ejecutar los callbacks»;
 * «muestra la cantidad actual».
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

import QuantitySelector from "./QuantitySelector.jsx";

describe("QuantitySelector", () => {
    it("permite bloquear ambos límites sin ejecutar los callbacks", async () => {
        const user = userEvent.setup(); const onIncrease = vi.fn(); const onDecrease = vi.fn();
        render(<QuantitySelector quantity={1} onIncrease={onIncrease} onDecrease={onDecrease} disabledIncrease disabledDecrease />);
        await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
        await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
        expect(onIncrease).not.toHaveBeenCalled(); expect(onDecrease).not.toHaveBeenCalled();
    });
    it("muestra la cantidad actual", () => {
        render(
            <QuantitySelector
                quantity={3}
            />
        );

        expect(
            screen.getByLabelText(
                "Cantidad actual"
            )
        ).toHaveTextContent(
            "3"
        );
    });

    it("ejecuta los callbacks de aumentar y disminuir", async () => {
        const user =
            userEvent.setup();

        const onIncrease =
            vi.fn();

        const onDecrease =
            vi.fn();

        render(
            <QuantitySelector
                quantity={2}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
            />
        );

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /aumentar cantidad/i
                }
            )
        );

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /disminuir cantidad/i
                }
            )
        );

        expect(
            onIncrease
        ).toHaveBeenCalledTimes(
            1
        );

        expect(
            onDecrease
        ).toHaveBeenCalledTimes(
            1
        );
    });
});
