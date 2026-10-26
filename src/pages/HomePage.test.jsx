import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import CartProvider from "../context/CartContext.jsx";
import { CART_KEY } from "../utils/cart.js";
import HomePage from "./HomePage.jsx";

function renderHome() {
    render(<CartProvider><MemoryRouter><HomePage /></MemoryRouter></CartProvider>);
}

describe("HomePage", () => {
    beforeEach(() => localStorage.clear());

    it("muestra la identidad KYNEX, la imagen original y accesos al catálogo", () => {
        renderHome();

        expect(screen.getByRole("heading", { level: 1, name: "Entrena mejor. Supérate." })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Productos KYNEX en un entorno de entrenamiento" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Explorar productos" })).toHaveAttribute("href", "/productos");
        expect(screen.getByRole("link", { name: "Ir a la tienda" })).toHaveAttribute("href", "/productos");
        expect(screen.getByRole("link", { name: "Ver destacados" })).toHaveAttribute("href", "#productos-destacados");
        expect(screen.getByRole("region", { name: "Productos destacados" })).toHaveAttribute("id", "productos-destacados");
        expect(screen.getByRole("region", { name: "Información de despacho" })).toHaveTextContent("Despacho gratis en compras desde $50.000");
        expect(screen.getByRole("heading", { name: "Suplementación clara" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Compra a tu ritmo" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Tu objetivo, tu elección" })).toBeInTheDocument();
        expect(screen.queryByText(/migración desde HTML/i)).not.toBeInTheDocument();
    });

    it("usa los datos de destacados y guarda las compras realizadas desde el inicio", async () => {
        const user = userEvent.setup();
        renderHome();
        const featured = within(screen.getByRole("region", { name: "Productos destacados" }));
        const card = featured.getByRole("heading", { level: 3, name: "Creatina Monohidratada" }).closest("article");

        expect(featured.queryByRole("heading", { name: "Multivitamínico Daily" })).not.toBeInTheDocument();
        await user.click(within(card).getByRole("button", { name: "Agregar" }));

        expect(featured.getByRole("status")).toHaveTextContent("Agregaste Creatina Monohidratada al carrito.");
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 1 }]);
    });

    it("respeta el stock y explica cuando el carrito ya tiene todas las unidades", async () => {
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 24 }]));
        const user = userEvent.setup();
        renderHome();
        const card = screen.getByRole("heading", { name: "Creatina Monohidratada" }).closest("article");
        const addButton = within(card).getByRole("button", { name: "Agregar" });

        await user.click(addButton);
        await user.click(addButton);

        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 25 }]);
        expect(screen.getByRole("status")).toHaveTextContent("Ya alcanzaste el stock disponible de Creatina Monohidratada en tu carrito.");
    });
});
