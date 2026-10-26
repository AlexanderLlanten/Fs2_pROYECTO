import {
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

import ProductsPage from "./ProductsPage.jsx";

function renderPage() {
    render(
        <MemoryRouter>
            <ProductsPage />
        </MemoryRouter>
    );
}

describe("ProductsPage", () => {
    it("filtra el catálogo al escribir en el buscador", async () => {
        const user =
            userEvent.setup();

        renderPage();

        await user.type(
            screen.getByRole(
                "searchbox",
                {
                    name:
                        /buscar productos/i
                }
            ),
            "creatina"
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
            screen.queryByRole(
                "heading",
                {
                    name:
                        "Whey Protein Performance"
                }
            )
        ).not.toBeInTheDocument();
    });

    it("filtra productos por categoría", async () => {
        const user =
            userEvent.setup();

        renderPage();

        await user.selectOptions(
            screen.getByRole(
                "combobox",
                {
                    name:
                        /filtrar por categoría/i
                }
            ),
            "Vitaminas"
        );

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "Multivitamínico Daily"
                }
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "Recovery Magnesium"
                }
            )
        ).toBeInTheDocument();

        expect(
            screen.queryByRole(
                "heading",
                {
                    name:
                        "Creatina Monohidratada"
                }
            )
        ).not.toBeInTheDocument();
    });
});
