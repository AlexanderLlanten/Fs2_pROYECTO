/*
 * Pruebas automatizadas.
 * Pruebas de integración. Portada y lectura de artículos, enlaces, rutas inexistentes y continuidad
 * de sesión y datos.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { PRODUCTS_KEY } from "./services/productStore.js";
import { ROUTINE_KEY } from "./services/routineStore.js";
import { CART_KEY } from "./utils/cart.js";

const articleCases = [
    ["creatina-y-rendimiento", "Creatina y rendimiento"],
    ["recuperacion-muscular", "Recuperación muscular"]
];
function openPage(path = "/blog", email) {
    if (email) loginUser(email, "1234");
    window.history.replaceState({}, "", path); return render(<App />);
}
function expectLayout() {
    expect(screen.getAllByRole("banner")).toHaveLength(1); expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Blog", exact: true })).toHaveAttribute("aria-current", "page");
}

describe("Blog y artículos integrados", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => window.history.replaceState({}, "", "/"));
    it.each([undefined, "camila@gmail.com", "martin@duoc.cl", "admin@profesor.duoc.cl"])("permite portada y ambos artículos con el perfil %s", async email => {
        const user = userEvent.setup(); openPage("/blog", email); expectLayout();
        for (const [, title] of articleCases) {
            await user.click(screen.getByRole("link", { name: `Leer artículo: ${title}` }));
            expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument(); expectLayout();
            await user.click(screen.getByRole("link", { name: "Volver al blog" }));
            expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
        }
    });
    it.each(articleCases)("abre directamente y restaura %s al recargar", (slug, title) => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]'); localStorage.setItem(ROUTINE_KEY, '[{"id":2,"sets":4,"reps":8}]');
        const view = openPage(`/blog/${slug}`, "camila@gmail.com");
        const keys = [CART_KEY, ROUTINE_KEY, SESSION_KEY, USERS_KEY, PRODUCTS_KEY]; const before = keys.map(key => localStorage.getItem(key));
        expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument(); expectLayout();
        view.unmount(); openPage(`/blog/${slug}`);
        expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        expect(keys.map(key => localStorage.getItem(key))).toEqual(before);
    });
    it("abre Blog desde cabecera y pie y cierra el menú móvil", async () => {
        const user = userEvent.setup(); openPage("/"); const header = within(screen.getByRole("banner"));
        await user.click(header.getByRole("button", { name: "Abrir menú" }));
        await user.click(header.getByRole("link", { name: "Blog", exact: true }));
        expect(header.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
        expect(window.location.pathname).toBe("/blog");
        await user.click(screen.getByRole("link", { name: "Leer artículo: Creatina y rendimiento" }));
        await user.click(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Blog", exact: true }));
        expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
    });
    it("reutiliza la lectura al pasar de un artículo a otro sin mezclar sus secciones", async () => {
        const user = userEvent.setup(); openPage("/blog/creatina-y-rendimiento");
        await user.click(screen.getByRole("link", { name: "Volver al blog" }));
        await user.click(screen.getByRole("link", { name: "Leer artículo: Recuperación muscular" }));
        expect(screen.getByRole("heading", { name: "Factores asociados a la recuperación" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "¿Qué es la creatina?" })).not.toBeInTheDocument();
        expect(within(screen.getByRole("main")).getAllByRole("listitem")).toHaveLength(5);
    });
    it.each([["/blog", "Blog"], ...articleCases.map(([slug, title]) => [`/blog/${slug}`, title])])("regresa a %s desde Login y conserva compra y rutina al cerrar sesión", async (path, title) => {
        const cart = '[{"id":2,"quantity":3}]'; const routine = '[{"id":1,"sets":5,"reps":9}]';
        localStorage.setItem(CART_KEY, cart); localStorage.setItem(ROUTINE_KEY, routine);
        const user = userEvent.setup(); openPage(`${path}?origen=pie`);
        await user.click(within(screen.getByRole("banner")).getByRole("link", { name: "Iniciar sesión", exact: true }));
        await user.click(screen.getByRole("textbox", { name: "Correo electrónico" })); await user.paste("martin@duoc.cl");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { level: 1, name: title })).toBeInTheDocument();
        expect(window.location.pathname + window.location.search).toBe(`${path}?origen=pie`);
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(window.location.pathname).toBe(path); expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(localStorage.getItem(CART_KEY)).toBe(cart); expect(localStorage.getItem(ROUTINE_KEY)).toBe(routine);
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();
    });
    it("abre la tienda desde la portada", async () => {
        const user = userEvent.setup(); openPage(); await user.click(screen.getByRole("link", { name: "Ver productos" }));
        expect(window.location.pathname).toBe("/productos");
        expect(screen.getByRole("heading", { name: "Suplementación para cada objetivo" })).toBeInTheDocument();
    });
    it("informa un artículo desconocido y ofrece volver a la portada", async () => {
        const user = userEvent.setup(); openPage("/blog/no-existe");
        expect(screen.getByRole("heading", { name: "Artículo no encontrado" })).toBeInTheDocument();
        expect(screen.queryByRole("article")).not.toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "Volver al blog" }));
        expect(screen.getAllByRole("article")).toHaveLength(2);
    });
    it("muestra 404 general en subcaminos sin implementar", () => {
        openPage("/blog/creatina-y-rendimiento/editar");
        expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
        expect(screen.queryByRole("article")).not.toBeInTheDocument();
    });
});
