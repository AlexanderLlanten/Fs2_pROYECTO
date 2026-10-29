/*
 * Pruebas automatizadas.
 * Pruebas de integración. Acceso a rutas administrativas según sesión y perfil, y conservación del
 * destino de retorno.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { defaultUsers } from "./data/users.js";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { CART_KEY } from "./utils/cart.js";

function openPage(path) {
    window.history.replaceState({}, "", path);
    return render(<App />);
}

describe("Acceso administrativo integrado", () => {
    beforeEach(() => { localStorage.clear(); window.history.replaceState({}, "", "/"); });
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });

    it.each(["/admin", "/admin/no-existe"])("exige sesión al abrir directamente %s", path => {
        openPage(path);
        expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/login");
        expect(screen.queryByRole("complementary", { name: "Menú administrativo" })).not.toBeInTheDocument();
    });

    it.each(["/admin", "/admin/usuarios", "/admin/productos/nuevo"])("envía al Cliente a la tienda al abrir %s", path => {
        loginUser("camila@gmail.com", "1234");
        openPage(path);
        expect(screen.getByRole("heading", { name: "Suplementación para cada objetivo" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/productos");
        expect(screen.queryByRole("link", { name: "Administración" })).not.toBeInTheDocument();
    });

    it.each(["martin@duoc.cl", "admin@profesor.duoc.cl"])("permite entrar y restaurar el panel para %s", email => {
        loginUser(email, "1234");
        const first = openPage("/admin");
        expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
        expect(screen.getByRole("article", { name: "Productos en catálogo" })).toHaveTextContent("6");
        expect(screen.getByRole("article", { name: "Unidades en stock" })).toHaveTextContent("122");
        expect(screen.getAllByRole("main")).toHaveLength(1);
        first.unmount();
        render(<App />);
        expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
    });

    it("regresa al panel solicitado después del Login y conserva el carrito al salir", async () => {
        const user = userEvent.setup();
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 3 }]));
        openPage("/admin?vista=resumen");
        await user.type(screen.getByRole("textbox", { name: "Correo electrónico" }), "martin@duoc.cl");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
        expect(window.location.pathname + window.location.search).toBe("/admin?vista=resumen");
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(await screen.findByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
        expect(screen.queryByRole("complementary", { name: "Menú administrativo" })).not.toBeInTheDocument();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 3 }]);
    });

    it("conserva el acceso y explica el fallo si no puede cerrar la sesión", async () => {
        const user = userEvent.setup();
        loginUser("admin@profesor.duoc.cl", "1234");
        openPage("/admin");
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("Bloqueado"); });
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(screen.getByRole("alert")).toHaveTextContent("almacenamiento");
        expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
    });

    it("revoca el acceso al panel y su enlace si cambian el rol a Cliente desde otra pestaña", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        openPage("/admin");
        act(() => {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 3 ? { ...user, role: "Cliente" } : user)));
            window.dispatchEvent(new StorageEvent("storage", { key: USERS_KEY, storageArea: localStorage }));
        });
        expect(screen.getByRole("heading", { name: "Suplementación para cada objetivo" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/productos");
        expect(screen.queryByRole("link", { name: "Administración" })).not.toBeInTheDocument();
    });

    it("retira el panel si otra pestaña cierra sesión", () => {
        loginUser("martin@duoc.cl", "1234");
        openPage("/admin");
        act(() => {
            localStorage.removeItem(SESSION_KEY);
            window.dispatchEvent(new StorageEvent("storage", { key: SESSION_KEY, storageArea: localStorage }));
        });
        expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
    });

    it("abre Administración desde la tienda solo al perfil autorizado", async () => {
        loginUser("martin@duoc.cl", "1234");
        const user = userEvent.setup();
        openPage("/productos");
        await user.click(screen.getByRole("link", { name: "Administración" }));
        expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "Volver a la tienda" }));
        expect(screen.getByRole("heading", { name: "Suplementación para cada objetivo" })).toBeInTheDocument();
    });

    it("ofrece una salida válida para rutas inexistentes públicas y administrativas", async () => {
        const user = userEvent.setup();
        const first = openPage("/no-existe");
        expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
        expect(within(screen.getByRole("main")).getByRole("link", { name: "Volver a la tienda" })).toHaveAttribute("href", "/productos");
        first.unmount();
        loginUser("martin@duoc.cl", "1234");
        openPage("/admin/no-existe");
        expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "Volver al panel" }));
        expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
    });
});
