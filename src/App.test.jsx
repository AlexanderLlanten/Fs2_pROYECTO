import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App.jsx";
import { CART_KEY } from "./utils/cart.js";

describe("Rutas públicas con PublicLayout", () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.replaceState({}, "", "/");
    });

    afterEach(() => {
        window.history.replaceState({}, "", "/");
    });

    it.each([
        ["/", "La evolución de KYNEX comienza aquí."],
        ["/productos", "Suplementación para cada objetivo"],
        ["/productos/2", "Creatina Monohidratada"],
        ["/productos/999", "Producto no encontrado"],
        ["/carrito", "Carrito de compras"]
    ])("carga %s con una sola cabecera, un main y un footer", (path, title) => {
        window.history.replaceState({}, "", path);
        render(<App />);

        expect(screen.getAllByRole("banner")).toHaveLength(1);
        expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        expect(within(screen.getByRole("main")).getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
        expect(within(screen.getByRole("banner")).getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();
    });

    it("mantiene el carrito y su contador al navegar entre inicio, catálogo, detalle y carrito", async () => {
        const user = userEvent.setup();
        render(<App />);
        const header = screen.getByRole("banner");

        await user.click(screen.getByRole("link", { name: "Explorar productos" }));
        const productCard = screen.getByRole("heading", { name: "Creatina Monohidratada" }).closest("article");

        await user.click(within(productCard).getByRole("button", { name: "Agregar" }));
        expect(within(header).getByRole("link", { name: "Carrito (1)" })).toBeInTheDocument();

        await user.click(within(productCard).getByRole("link", { name: "Ver detalle" }));
        expect(screen.getByText("KYN002")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
        await user.click(within(header).getByRole("link", { name: "Carrito (2)" }));

        expect(screen.getByRole("heading", { name: "Carrito de compras" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Creatina Monohidratada" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
        expect(within(header).getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
        expect(within(header).getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Eliminar Creatina Monohidratada del carrito" }));
        expect(within(header).getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Tu carrito está vacío" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([]);
        expect(screen.getByRole("banner")).toBe(header);
    });

    it("recupera el carrito al recargar y actualiza el contador al vaciarlo", async () => {
        const user = userEvent.setup();
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 3 }]));
        window.history.replaceState({}, "", "/carrito");
        const firstRender = render(<App />);
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();

        firstRender.unmount();
        render(<App />);
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Vaciar carrito" }));
        expect(screen.getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Tu carrito está vacío" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([]);
    });
});
