import {
    beforeEach,
    describe,
    expect,
    it
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
    MemoryRouter
} from "react-router-dom";

import CartProvider from "../context/CartContext.jsx";
import CartPage from "./CartPage.jsx";
import { productImages } from "../data/productImages.js";

function renderCartPage() {
    render(
        <CartProvider>
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>
        </CartProvider>
    );
}

describe("CartPage", () => {
    beforeEach(
        () => {
            localStorage.clear();
        }
    );

    it("muestra el estado vacío cuando no existen productos", () => {
        renderCartPage();

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "Tu carrito está vacío"
                }
            )
        ).toBeInTheDocument();
    });

    it("renderiza productos almacenados y permite vaciar el carrito", async () => {
        localStorage.setItem(
            "kynex_cart",
            JSON.stringify([
                {
                    id: 2,
                    quantity: 1
                }
            ])
        );

        const user =
            userEvent.setup();

        renderCartPage();

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "Creatina Monohidratada"
                }
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("img", { name: "Creatina Monohidratada" })
        ).toHaveAttribute("src", productImages.KYN002);

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /vaciar carrito/i
                }
            )
        );

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "Tu carrito está vacío"
                }
            )
        ).toBeInTheDocument();
    });
});
