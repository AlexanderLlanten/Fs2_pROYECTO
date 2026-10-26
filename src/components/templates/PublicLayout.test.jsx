import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";

import CartProvider from "../../context/CartContext.jsx";
import PublicLayout from "./PublicLayout.jsx";

function renderLayout() {
    render(
        <CartProvider>
            <MemoryRouter>
                <Routes>
                    <Route element={<PublicLayout />}>
                        <Route index element={<><h1>Página de inicio</h1><Link to="/productos">Ver catálogo</Link></>} />
                        <Route path="productos" element={<h1>Catálogo de productos</h1>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </CartProvider>
    );
}

describe("PublicLayout", () => {
    beforeEach(() => localStorage.clear());

    it("compone una cabecera, el contenido de la ruta y un pie de página", () => {
        renderLayout();

        expect(screen.getAllByRole("banner")).toHaveLength(1);
        expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        expect(within(screen.getByRole("main")).getByRole("heading", { name: "Página de inicio" })).toBeInTheDocument();

        const skipLink = screen.getByRole("link", { name: "Saltar al contenido principal" });
        expect(skipLink).toHaveAttribute("href", "#main-content");
        expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
        expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
    });

    it("cambia el contenido del Outlet conservando la cabecera y el pie compartidos", async () => {
        const user = userEvent.setup();
        renderLayout();
        const header = screen.getByRole("banner");
        const footer = screen.getByRole("contentinfo");

        await user.click(screen.getByRole("link", { name: "Ver catálogo" }));

        expect(within(screen.getByRole("main")).getByRole("heading", { name: "Catálogo de productos" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Página de inicio" })).not.toBeInTheDocument();
        expect(screen.getByRole("banner")).toBe(header);
        expect(screen.getByRole("contentinfo")).toBe(footer);
    });
});
