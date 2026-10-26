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

import ProductCard from "./ProductCard.jsx";

const product = {
    id: 1,
    name: "Whey Protein Performance",
    category: "Proteínas",
    price: 39990,
    stock: 18,
    criticalStock: 5,
    code: "KYN001",
    format: "2 lb",
    flavor: "Chocolate",
    description:
        "Proteína de suero orientada al apoyo nutricional posterior al entrenamiento.",
    icon: "bi-cup-straw"
};

function renderProductCard(
    props = {}
) {
    render(
        <MemoryRouter>
            <ProductCard
                product={product}
                {...props}
            />
        </MemoryRouter>
    );
}

describe("ProductCard", () => {
    it("renderiza los datos principales recibidos mediante la prop product", () => {
        renderProductCard();

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "Whey Protein Performance"
                }
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Proteínas"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /39\.990/
            )
        ).toBeInTheDocument();
    });

    it("entrega el producto al callback cuando se presiona Agregar", async () => {
        const user =
            userEvent.setup();

        const handleAddToCart =
            vi.fn();

        renderProductCard({
            onAddToCart:
                handleAddToCart
        });

        await user.click(
            screen.getByRole(
                "button",
                {
                    name: /agregar/i
                }
            )
        );

        expect(
            handleAddToCart
        ).toHaveBeenCalledWith(
            product
        );
    });
});
