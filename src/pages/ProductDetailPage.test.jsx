/*
 * Pruebas automatizadas.
 * Pruebas de ProductDetailPage. Casos: «muestra el producto correspondiente al id de la ruta»;
 * «muestra un estado de error cuando el producto no existe».
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

import {
    MemoryRouter,
    Route,
    Routes
} from "react-router-dom";

import CartProvider from "../context/CartContext.jsx";
import ProductDetailPage from "./ProductDetailPage.jsx";

function renderDetail(
    initialEntry
) {
    render(
        <CartProvider>
            <MemoryRouter
                initialEntries={[
                    initialEntry
                ]}
            >
                <Routes>
                    <Route
                        path="/productos/:id"
                        element={<ProductDetailPage />}
                    />
                </Routes>
            </MemoryRouter>
        </CartProvider>
    );
}

describe("ProductDetailPage", () => {
    it("muestra el producto correspondiente al id de la ruta", () => {
        renderDetail(
            "/productos/2"
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
            screen.getByText(
                "KYN002"
            )
        ).toBeInTheDocument();
    });

    it("muestra un estado de error cuando el producto no existe", () => {
        renderDetail(
            "/productos/999"
        );

        expect(
            screen.getByRole(
                "heading",
                {
                    name:
                        "Producto no encontrado"
                }
            )
        ).toBeInTheDocument();
    });
});
