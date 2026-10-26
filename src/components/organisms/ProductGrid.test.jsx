import {
    describe,
    expect,
    it
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import ProductGrid from "./ProductGrid.jsx";

const products = [
    {
        id: 1,
        name: "Whey Protein Performance",
        category: "Proteínas",
        price: 39990,
        stock: 18,
        criticalStock: 5,
        code: "KYN001",
        format: "2 lb",
        flavor: "Chocolate",
        description: "Proteína de prueba",
        icon: "bi-cup-straw"
    },
    {
        id: 2,
        name: "Creatina Monohidratada",
        category: "Creatinas",
        price: 21990,
        stock: 25,
        criticalStock: 5,
        code: "KYN002",
        format: "300 g",
        flavor: "Sin sabor",
        description: "Creatina de prueba",
        icon: "bi-lightning-charge"
    }
];

function renderGrid(
    productList
) {
    render(
        <MemoryRouter>
            <ProductGrid
                products={productList}
            />
        </MemoryRouter>
    );
}

describe("ProductGrid", () => {
    it("renderiza una tarjeta por cada producto recibido mediante props", () => {
        renderGrid(
            products
        );

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
            screen.getByRole(
                "heading",
                {
                    name:
                        "Creatina Monohidratada"
                }
            )
        ).toBeInTheDocument();
    });

    it("muestra un estado vacío cuando no existen productos", () => {
        renderGrid(
            []
        );

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "No encontramos productos"
                }
            )
        ).toBeInTheDocument();
    });
});
