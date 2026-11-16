/*
 * Pruebas automatizadas.
 * Pruebas de Navbar. Casos: «enlaza la marca y las páginas públicas con un carrito vacío»; «recupera
 * el total de unidades guardadas, no solo los productos distintos».
 */

import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import CartProvider from "../../context/CartContext.jsx";
import AuthProvider from "../../context/AuthContext.jsx";
import { products } from "../../data/products.js";
import useCart from "../../hooks/useCart.js";
import { CART_KEY } from "../../utils/cart.js";
import Navbar from "./Navbar.jsx";

function CartActions() {
    const { addToCart, removeFromCart, clearCart } = useCart();

    return (
        <>
            <button onClick={() => addToCart(products[0])}>Agregar producto</button>
            <button onClick={() => removeFromCart(products[0].id)}>Eliminar producto</button>
            <button onClick={clearCart}>Vaciar</button>
        </>
    );
}

function renderNavbar(initialEntry = "/") {
    return render(
        <AuthProvider><CartProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Navbar />
                <CartActions />
                <Routes>
                    <Route path="*" element={<p>Contenido de la página</p>} />
                </Routes>
            </MemoryRouter>
        </CartProvider></AuthProvider>
    );
}

describe("Navbar", () => {
    beforeEach(() => localStorage.clear());

    it("enlaza la marca y las páginas públicas con un carrito vacío", () => {
        renderNavbar();
        const nav = within(screen.getByRole("navigation", { name: "Navegación principal" }));

        expect(nav.getByRole("link", { name: "KYNEX" })).toHaveAttribute("href", "/");
        expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
        expect(nav.getByRole("link", { name: "Tienda" })).toHaveAttribute("href", "/productos");
        expect(nav.queryByRole("link", { name: "Contacto" })).not.toBeInTheDocument();
        expect(nav.getByRole("link", { name: "Entrenamiento" })).toHaveAttribute("href", "/entrenamiento");
        expect(nav.getByRole("link", { name: "Mi rutina" })).toHaveAttribute("href", "/rutina");
        expect(nav.queryByRole("link", { name: "Nosotros" })).not.toBeInTheDocument();
        expect(nav.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute("href", "/blog");
        expect(nav.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
        expect(nav.getByRole("link", { name: "Carrito (0)" })).toHaveAttribute("href", "/carrito");
    });

    it.each([
        ["/", "Inicio"],
        ["/productos", "Tienda"],
        ["/productos/2", "Tienda"],
        ["/carrito", "Carrito (0)"],
        ["/login", "Iniciar sesión"],
        ["/contacto", null],
        ["/entrenamiento", "Entrenamiento"],
        ["/rutina", "Mi rutina"],
        ["/nosotros", null],
        ["/blog", "Blog"],
        ["/blog/creatina-y-rendimiento", "Blog"],
        ["/blog/recuperacion-muscular", "Blog"]
    ])("marca el enlace de %s cuando está presente en la cabecera", (path, activeLink) => {
        renderNavbar(path);

        if (activeLink) expect(screen.getByRole("link", { name: activeLink })).toHaveAttribute("aria-current", "page");
        const activeLinks = screen.getAllByRole("link").filter(
            link => link.getAttribute("aria-current") === "page"
        );
        expect(activeLinks).toHaveLength(activeLink ? 1 : 0);
    });

    it("recupera el total de unidades guardadas, no solo los productos distintos", () => {
        localStorage.setItem(CART_KEY, JSON.stringify([
            { id: 1, quantity: 2 },
            { id: 2, quantity: 3 }
        ]));
        renderNavbar();

        expect(screen.getByRole("link", { name: "Carrito (5)" })).toBeInTheDocument();
    });

    it("actualiza el contador al agregar, eliminar y vaciar el carrito", async () => {
        const user = userEvent.setup();
        renderNavbar();

        await user.click(screen.getByRole("button", { name: "Agregar producto" }));
        await user.click(screen.getByRole("button", { name: "Agregar producto" }));
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Eliminar producto" }));
        expect(screen.getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Agregar producto" }));
        await user.click(screen.getByRole("button", { name: "Vaciar" }));
        expect(screen.getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();
    });

    it("abre y cierra el menú móvil y lo cierra al navegar", async () => {
        const user = userEvent.setup();
        renderNavbar();
        const toggle = screen.getByRole("button", { name: "Abrir menú" });
        const menu = document.getElementById(toggle.getAttribute("aria-controls"));
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(menu).not.toContainElement(screen.getByRole("link", { name: "Carrito (0)" }));

        await user.click(toggle);
        expect(screen.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");
        expect(menu).toHaveClass("show");

        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(menu).not.toHaveClass("show");

        await user.click(toggle);
        await user.click(screen.getByRole("link", { name: "Tienda" }));
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(menu).not.toHaveClass("show");
        expect(screen.getByRole("link", { name: "Tienda" })).toHaveAttribute("aria-current", "page");
    });

    it("cierra el menú con Escape y devuelve el foco al botón", async () => {
        const user = userEvent.setup();
        renderNavbar();
        await user.click(screen.getByRole("button", { name: "Abrir menú" }));
        screen.getByRole("link", { name: "Tienda" }).focus();
        await user.keyboard("{Escape}");
        expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus();
        expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
    });

    it("cierra el menú al pulsar fuera de la cabecera", async () => {
        const user = userEvent.setup();
        renderNavbar();
        await user.click(screen.getByRole("button", { name: "Abrir menú" }));
        await user.click(screen.getByText("Contenido de la página"));
        expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
    });

    it("cierra el menú al pasar al ancho de escritorio", async () => {
        const user = userEvent.setup();
        renderNavbar();
        await user.click(screen.getByRole("button", { name: "Abrir menú" }));
        const original = window.innerWidth;
        try {
            window.innerWidth = 1280;
            fireEvent.resize(window);
            expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
        } finally { window.innerWidth = original; }
    });
});
