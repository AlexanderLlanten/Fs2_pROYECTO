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
