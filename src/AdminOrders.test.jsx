import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { defaultUsers } from "./data/users.js";
import { products } from "./data/products.js";
import { PRODUCTS_KEY } from "./services/productStore.js";
import { CART_KEY } from "./utils/cart.js";
import * as orderService from "./services/adminOrders.js";

function openPage(path = "/admin/pedidos", email = "admin@profesor.duoc.cl") {
    if (email) loginUser(email, "1234");
    window.history.replaceState({}, "", path); return render(<App />);
}

describe("Consulta de pedidos integrada", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });
    it.each(["/admin/pedidos", "/admin/pedidos/1001", "/admin/pedidos/999"])("exige sesión antes de mostrar %s", path => {
        openPage(path, null);
        expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
        expect(screen.queryByText("Camila Soto Pérez")).not.toBeInTheDocument();
    });
    it.each(["/admin/pedidos", "/admin/pedidos/1001", "/admin/pedidos/1001/extra"])("envía Cliente a la tienda en %s", path => {
        openPage(path, "camila@gmail.com");
        expect(window.location.pathname).toBe("/productos");
        expect(screen.queryByRole("link", { name: "Pedidos", exact: true })).not.toBeInTheDocument();
    });
    it.each(["admin@profesor.duoc.cl", "martin@duoc.cl"])("navega entre lista, detalle y regreso como %s", async email => {
        const user = userEvent.setup(); const first = openPage("/admin/pedidos", email);
        expect(screen.getByRole("table", { name: "Pedidos registrados en KYNEX" })).toHaveTextContent("#1001");
        expect(screen.getByRole("link", { name: "Pedidos", exact: true })).toHaveAttribute("aria-current", "page");
        expect(screen.getAllByRole("main")).toHaveLength(1);
        await user.click(screen.getByRole("link", { name: "Ver pedido 1001" }));
        expect(screen.getByRole("heading", { level: 1, name: "Pedido #1001" })).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Resumen del pedido" })).toHaveTextContent("$61.980");
        expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(3);
        first.unmount(); render(<App />);
        expect(screen.getByRole("heading", { level: 1, name: "Pedido #1001" })).toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "Volver a pedidos" }));
        expect(window.location.pathname).toBe("/admin/pedidos");
    });
    it.each(["admin@profesor.duoc.cl", "martin@duoc.cl"])("retorna al detalle y su consulta después del Login de %s", async email => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]');
        const user = userEvent.setup(); openPage("/admin/pedidos/1002?origen=panel", null);
        await user.click(screen.getByRole("textbox", { name: "Correo electrónico" })); await user.paste(email);
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { name: "Pedido #1002" })).toBeInTheDocument();
        expect(window.location.pathname + window.location.search).toBe("/admin/pedidos/1002?origen=panel");
        expect(localStorage.getItem(CART_KEY)).toBe('[{"id":2,"quantity":2}]');
    });
    it.each(["999", "invalido", "1001abc", "1e3"])("informa un pedido inexistente o id inválido: %s", id => {
        openPage(`/admin/pedidos/${id}`);
        expect(screen.getByRole("heading", { name: "Pedido no encontrado" })).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("El pedido solicitado no existe");
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Volver a pedidos" })).toHaveAttribute("href", "/admin/pedidos");
    });
    it("no reconstruye importes históricos con los precios o productos actuales", () => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products.filter(product => product.id !== 2).map(product => ({ ...product, price: 0, name: "Nuevo catálogo" }))));
        openPage("/admin/pedidos/1001");
        expect(screen.getByRole("region", { name: "Resumen del pedido" })).toHaveTextContent("$61.980");
        expect(screen.getByRole("row", { name: /Whey Protein Performance/ })).toHaveTextContent("$39.990");
        expect(screen.getByRole("row", { name: /Creatina Monohidratada/ })).toHaveTextContent("$21.990");
    });
    it("retira el detalle y sus datos al perder permiso desde otra pestaña", () => {
        openPage("/admin/pedidos/1001", "martin@duoc.cl");
        act(() => {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 2 ? { ...user, role: "Cliente" } : user)));
            window.dispatchEvent(new StorageEvent("storage", { key: USERS_KEY, storageArea: localStorage }));
        });
        expect(window.location.pathname).toBe("/productos");
        expect(screen.queryByText("Camila Soto Pérez")).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Pedidos", exact: true })).not.toBeInTheDocument();
    });
    it("retira el detalle si otra pestaña cierra la sesión", () => {
        openPage("/admin/pedidos/1001");
        act(() => {
            localStorage.removeItem(SESSION_KEY);
            window.dispatchEvent(new StorageEvent("storage", { key: SESSION_KEY, storageArea: localStorage }));
        });
        expect(window.location.pathname).toBe("/login");
        expect(screen.queryByText("Camila Soto Pérez")).not.toBeInTheDocument();
    });
    it.each(["admin@profesor.duoc.cl", "martin@duoc.cl"])("ofrece los accesos del panel según el perfil de %s", async email => {
        const user = userEvent.setup(); openPage("/admin", email);
        const modules = within(screen.getByRole("region", { name: "Gestión KYNEX" }));
        expect(modules.getByRole("link", { name: "Consultar productos" })).toHaveAttribute("href", "/admin/productos");
        expect(modules.queryByRole("link", { name: "Gestionar usuarios" }) !== null).toBe(email.startsWith("admin@"));
        await user.click(modules.getByRole("link", { name: "Consultar pedidos" }));
        expect(screen.getByRole("heading", { level: 1, name: "Pedidos" })).toBeInTheDocument();
    });
    it("cierra el menú móvil al navegar hacia Pedidos", async () => {
        const user = userEvent.setup(); openPage("/admin", "martin@duoc.cl");
        await user.click(screen.getByRole("button", { name: "Abrir menú administrativo" }));
        await user.click(screen.getByRole("link", { name: "Pedidos", exact: true }));
        expect(screen.getByRole("button", { name: "Abrir menú administrativo" })).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByRole("heading", { level: 1, name: "Pedidos" })).toBeInTheDocument();
    });
    it("muestra 404 para un subcamino desconocido de pedidos", () => {
        openPage("/admin/pedidos/1001/extra", "martin@duoc.cl");
        expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
    });
    it("no muestra la lista si el servicio deniega el acceso y permite revisar la sesión", async () => {
        vi.spyOn(orderService, "listManagedOrders").mockReturnValue({ success: false, code: "FORBIDDEN", message: "Acceso denegado." });
        const user = userEvent.setup(); openPage();
        expect(screen.getByRole("alert")).toHaveTextContent("Acceso denegado");
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        localStorage.removeItem(SESSION_KEY);
        await user.click(screen.getByRole("button", { name: "Revisar acceso" }));
        expect(window.location.pathname).toBe("/login");
    });
    it("no presenta datos de detalle cuando el servicio deniega la consulta", () => {
        vi.spyOn(orderService, "getManagedOrder").mockReturnValue({ success: false, code: "FORBIDDEN", message: "Acceso denegado." });
        openPage("/admin/pedidos/1001");
        expect(screen.getByRole("heading", { name: "Pedido no disponible" })).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
});
