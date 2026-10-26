import {
    describe,
    expect,
    it,
    beforeEach
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import CartProvider from "./CartContext.jsx";
import useCart from "../hooks/useCart.js";

function CartTestHarness() {
    const {
        totalItems,
        subtotal,
        addToCart,
        decreaseQuantity,
        clearCart
    } = useCart();

    return (
        <div>
            <span data-testid="total-items">
                {totalItems}
            </span>

            <span data-testid="subtotal">
                {subtotal}
            </span>

            <button
                type="button"
                onClick={
                    () =>
                        addToCart(
                            {
                                id: 2,
                                stock: 25
                            }
                        )
                }
            >
                Agregar creatina
            </button>

            <button
                type="button"
                onClick={
                    () =>
                        decreaseQuantity(
                            2
                        )
                }
            >
                Disminuir creatina
            </button>

            <button
                type="button"
                onClick={
                    clearCart
                }
            >
                Vaciar
            </button>
        </div>
    );
}

function renderCart() {
    render(
        <CartProvider>
            <CartTestHarness />
        </CartProvider>
    );
}

describe("CartContext", () => {
    beforeEach(
        () => {
            localStorage.clear();
        }
    );

    it("agrega productos y actualiza cantidad y subtotal global", async () => {
        const user =
            userEvent.setup();

        renderCart();

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /agregar creatina/i
                }
            )
        );

        expect(
            screen.getByTestId(
                "total-items"
            )
        ).toHaveTextContent(
            "1"
        );

        expect(
            screen.getByTestId(
                "subtotal"
            )
        ).toHaveTextContent(
            "21990"
        );
    });

    it("elimina el producto cuando su cantidad disminuye desde uno", async () => {
        const user =
            userEvent.setup();

        renderCart();

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /agregar creatina/i
                }
            )
        );

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /disminuir creatina/i
                }
            )
        );

        expect(
            screen.getByTestId(
                "total-items"
            )
        ).toHaveTextContent(
            "0"
        );
    });

    it("vacía el carrito completo", async () => {
        const user =
            userEvent.setup();

        renderCart();

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /agregar creatina/i
                }
            )
        );

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /vaciar/i
                }
            )
        );

        expect(
            screen.getByTestId(
                "total-items"
            )
        ).toHaveTextContent(
            "0"
        );
    });
});
