import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { CART_KEY } from "./utils/cart.js";
import { PRODUCTS_KEY } from "./services/productStore.js";
import { fillContact } from "./test/contact.js";

function openPage(path = "/contacto", email) {
    if (email) loginUser(email, "1234");
    window.history.replaceState({}, "", path); return render(<App />);
}

describe("Contacto integrado", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });
    it.each([undefined, "camila@gmail.com", "martin@duoc.cl", "admin@profesor.duoc.cl"])("abre la página pública con el perfil %s", email => {
        openPage("/contacto", email);
        expect(screen.getByRole("heading", { level: 1, name: "Hablemos" })).toBeInTheDocument();
        expect(screen.getByRole("form", { name: "Formulario de contacto" })).toBeInTheDocument();
        expect(screen.getAllByRole("banner")).toHaveLength(1); expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        expect(within(screen.getByRole("banner")).getByRole("link", { name: "Contacto" })).toHaveAttribute("aria-current", "page");
        expect(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "/contacto");
    });
    it("abre Contacto desde la cabecera y cierra el menú móvil", async () => {
        const user = userEvent.setup(); openPage("/");
        const header = within(screen.getByRole("banner"));
        await user.click(header.getByRole("button", { name: "Abrir menú" }));
        await user.click(header.getByRole("link", { name: "Contacto" }));
        expect(screen.getByRole("heading", { name: "Hablemos" })).toBeInTheDocument();
        expect(header.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
    });
    it("navega desde el pie conservando la compra y el contador", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":3}]');
        const user = userEvent.setup(); openPage("/productos");
        await user.click(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Contacto" }));
        expect(window.location.pathname).toBe("/contacto");
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();
        expect(localStorage.getItem(CART_KEY)).toBe('[{"id":2,"quantity":3}]');
    });
    it("valida localmente sin enviar una petición ni modificar sesión, catálogo o compra", async () => {
        const request = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true });
        const user = userEvent.setup(); openPage("/contacto", "camila@gmail.com");
        const keys = [USERS_KEY, SESSION_KEY, CART_KEY, PRODUCTS_KEY];
        const before = keys.map(key => localStorage.getItem(key));
        await fillContact(user); await user.click(screen.getByRole("button", { name: "Validar mensaje" }));
        expect(screen.getByRole("status")).toHaveTextContent("Mensaje validado correctamente");
        expect(request).not.toHaveBeenCalled();
        expect(keys.map(key => localStorage.getItem(key))).toEqual(before);
        expect(screen.getByText("Esta demostración valida el formulario; no envía mensajes.")).toBeInTheDocument();
    });
    it("vuelve a Contacto después de iniciar sesión desde la página", async () => {
        const user = userEvent.setup(); openPage("/contacto?origen=pie");
        await user.click(within(screen.getByRole("banner")).getByRole("link", { name: "Iniciar sesión", exact: true }));
        await user.click(screen.getByRole("textbox", { name: "Correo electrónico" })); await user.paste("martin@duoc.cl");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { name: "Hablemos" })).toBeInTheDocument();
        expect(window.location.pathname + window.location.search).toBe("/contacto?origen=pie");
    });
    it("conserva el borrador al cerrar sesión en la misma página pública", async () => {
        const user = userEvent.setup(); openPage("/contacto", "camila@gmail.com");
        await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Borrador");
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(window.location.pathname).toBe("/contacto");
        expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue("Borrador");
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
});
