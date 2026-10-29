/*
 * Pruebas automatizadas.
 * Pruebas de integración. Información institucional, navegación y conservación de compra y rutina con
 * distintos perfiles.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { PRODUCTS_KEY } from "./services/productStore.js";
import { ROUTINE_KEY } from "./services/routineStore.js";
import { CART_KEY } from "./utils/cart.js";

function openPage(path = "/nosotros", email) {
    if (email) loginUser(email, "1234");
    window.history.replaceState({}, "", path); return render(<App />);
}

describe("Nosotros integrado", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => window.history.replaceState({}, "", "/"));
    it.each([undefined, "camila@gmail.com", "martin@duoc.cl", "admin@profesor.duoc.cl"])("abre la ruta pública con el perfil %s", email => {
        openPage("/nosotros", email);
        expect(screen.getByRole("heading", { level: 1, name: "Nuestra tienda" })).toBeInTheDocument();
        expect(screen.getAllByRole("banner")).toHaveLength(1); expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        expect(within(screen.getByRole("banner")).getByRole("link", { name: "Nosotros" })).toHaveAttribute("aria-current", "page");
    });
    it("navega desde cabecera y pie y cierra el menú móvil", async () => {
        const user = userEvent.setup(); openPage("/");
        const header = within(screen.getByRole("banner"));
        await user.click(header.getByRole("button", { name: "Abrir menú" }));
        await user.click(header.getByRole("link", { name: "Nosotros" }));
        expect(header.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
        expect(window.location.pathname).toBe("/nosotros");
        await user.click(header.getByRole("link", { name: "Tienda" }));
        await user.click(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Nosotros" }));
        expect(screen.getByRole("heading", { name: "Nuestra tienda" })).toBeInTheDocument();
    });
    it.each(["Proteínas", "Creatinas", "Pre-entreno", "Vitaminas"])("abre %s con el catálogo filtrado", async name => {
        const user = userEvent.setup(); openPage();
        await user.click(screen.getByRole("link", { name: `Explorar ${name}` }));
        expect(screen.getByRole("heading", { level: 1, name: "Suplementación para cada objetivo" })).toBeInTheDocument();
        expect(screen.getByRole("combobox", { name: "Filtrar por categoría" })).toHaveValue(name);
        expect(new URLSearchParams(window.location.search).get("categoria")).toBe(name);
        expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
    });
    it.each(["Explorar catálogo", "Ir a la tienda"])("abre el catálogo completo desde %s", async name => {
        const user = userEvent.setup(); openPage(); await user.click(screen.getByRole("link", { name }));
        expect(window.location.pathname + window.location.search).toBe("/productos");
        expect(screen.getByRole("combobox", { name: "Filtrar por categoría" })).toHaveValue("all");
        expect(screen.getAllByRole("article")).toHaveLength(6);
    });
    it("vuelve desde Login y conserva compra y rutina al cerrar sesión", async () => {
        const cart = '[{"id":2,"quantity":3}]'; const routine = '[{"id":2,"sets":5,"reps":9}]';
        localStorage.setItem(CART_KEY, cart); localStorage.setItem(ROUTINE_KEY, routine);
        const user = userEvent.setup(); openPage("/nosotros?origen=pie");
        await user.click(within(screen.getByRole("banner")).getByRole("link", { name: "Iniciar sesión", exact: true }));
        await user.click(screen.getByRole("textbox", { name: "Correo electrónico" })); await user.paste("martin@duoc.cl");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { name: "Nuestra tienda" })).toBeInTheDocument();
        expect(window.location.pathname + window.location.search).toBe("/nosotros?origen=pie");
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(window.location.pathname).toBe("/nosotros");
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();
        expect(localStorage.getItem(CART_KEY)).toBe(cart); expect(localStorage.getItem(ROUTINE_KEY)).toBe(routine);
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
    it("restaura la ruta al recargar sin modificar datos guardados", () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]');
        localStorage.setItem(ROUTINE_KEY, '[{"id":1,"sets":4,"reps":10}]');
        const view = openPage("/nosotros", "camila@gmail.com");
        const keys = [CART_KEY, ROUTINE_KEY, SESSION_KEY, USERS_KEY, PRODUCTS_KEY];
        const before = keys.map(key => localStorage.getItem(key));
        view.unmount(); openPage();
        expect(screen.getByRole("heading", { name: "Nuestra tienda" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        expect(screen.getByText("Camila")).toBeInTheDocument();
        expect(keys.map(key => localStorage.getItem(key))).toEqual(before);
    });
    it("muestra 404 en un subcamino desconocido sin marcar Nosotros como activo", () => {
        openPage("/nosotros/desconocido");
        expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
        expect(within(screen.getByRole("banner")).getByRole("link", { name: "Nosotros" })).not.toHaveAttribute("aria-current");
    });
});
