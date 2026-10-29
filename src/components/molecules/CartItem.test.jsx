/*
 * Pruebas automatizadas.
 * Pruebas de CartItem. Casos: «muestra el producto y el total de su línea»; «ejecuta la eliminación
 * del producto».
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

import {
    MemoryRouter
} from "react-router-dom";

import CartItem from "./CartItem.jsx";
import { productImages } from "../../data/productImages.js";

const product = {
    id: 2,
    code: "KYN002",
    name: "Creatina Monohidratada",
    category: "Creatinas",
    price: 21990,
    quantity: 2,
    stock: 25,
    format: "300 g",
    flavor: "Sin sabor",
    icon: "bi-lightning-charge"
};

describe("CartItem", () => {
    it("muestra el producto y el total de su línea", () => {
        render(
            <MemoryRouter>
                <CartItem
                    product={product}
                />
            </MemoryRouter>
        );

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
            screen.getByRole("img", { name: product.name })
        ).toHaveAttribute("src", productImages.KYN002);

        expect(
            screen.getByText(
                /43\.980/
            )
        ).toBeInTheDocument();
    });

    it("ejecuta la eliminación del producto", async () => {
        const user =
            userEvent.setup();

        const onRemove =
            vi.fn();

        render(
            <MemoryRouter>
                <CartItem
                    product={product}
                    onRemove={onRemove}
                />
            </MemoryRouter>
        );

        await user.click(
            screen.getByRole(
                "button",
                {
                    name:
                        /eliminar creatina monohidratada/i
                }
            )
        );

        expect(
            onRemove
        ).toHaveBeenCalledTimes(
            1
        );
    });
});
