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
    MemoryRouter,
    useLocation,
    useNavigate
} from "react-router-dom";

import CartProvider from "../context/CartContext.jsx";
import ProductsPage from "./ProductsPage.jsx";

function RouterControls() {
    const { search } = useLocation();
    const navigate = useNavigate();

    return (
        <>
            <output aria-label="Filtro en la URL">{search}</output>
            <button onClick={() => navigate(-1)}>Volver</button>
        </>
    );
}

function renderPage(initialEntry = "/productos") {
    render(
        <CartProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <ProductsPage />
                <RouterControls />
            </MemoryRouter>
        </CartProvider>
    );
}

describe("ProductsPage", () => {
    it("abre una categoría desde un enlace con tilde", () => {
        renderPage("/productos?categoria=Prote%C3%ADnas");

        expect(screen.getByRole("combobox", { name: /filtrar por categoría/i })).toHaveValue("Proteínas");
        expect(screen.getByRole("heading", { name: "Whey Protein Performance" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Plant Protein Vegan" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Creatina Monohidratada" })).not.toBeInTheDocument();
    });

    it.each(["Desconocida", ""])("muestra todo el catálogo para la categoría inválida '%s'", category => {
        renderPage(`/productos?categoria=${category}`);

        expect(screen.getByRole("combobox", { name: /filtrar por categoría/i })).toHaveValue("all");
        expect(screen.getAllByRole("article")).toHaveLength(6);
    });

    it("sincroniza el filtro con la URL, respeta Volver y permite restablecerlo", async () => {
        const user = userEvent.setup();
        renderPage("/productos?origen=inicio&categoria=Creatinas");
        const filter = screen.getByRole("combobox", { name: /filtrar por categoría/i });

        await user.selectOptions(filter, "Vitaminas");
        expect(screen.getByLabelText("Filtro en la URL")).toHaveTextContent("?origen=inicio&categoria=Vitaminas");
        expect(screen.getByRole("heading", { name: "Multivitamínico Daily" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Volver" }));
        expect(filter).toHaveValue("Creatinas");
        expect(screen.getByRole("heading", { name: "Creatina Monohidratada" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Multivitamínico Daily" })).not.toBeInTheDocument();

        await user.selectOptions(filter, "all");
        expect(screen.getByLabelText("Filtro en la URL")).toHaveTextContent("?origen=inicio");
        expect(screen.getAllByRole("article")).toHaveLength(6);
    });

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
