import { beforeEach, afterEach, afterAll, describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.hoisted(() => vi.stubEnv("VITE_DATA_SOURCE", "api"));
import App from "./App.jsx";
import { apiSession } from "./services/api/session.js";
import { remoteCatalog } from "./services/api/catalogStore.js";

const initial = { id: 2, code: "KYN002", name: "Creatina del servidor", category: "Creatinas", categoryId: 2,
    description: "Descripción", price: 21990, stock: 25, criticalStock: 5, image: "/media/products/creatina.png", version: 0,
    featured: true, ingredients: ["Creatina monohidratada"], usage: { serving: "5 g" } };
let records, role, mutations;
beforeEach(async () => {
    records = [structuredClone(initial)]; role = "Administrador"; mutations = [];
    localStorage.clear(); sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async (address, options) => {
        const path = new URL(address).pathname.replace("/api/v1", "");
        const data = options.body ? JSON.parse(options.body) : null;
        let result;
        if (path === "/auth/csrf") result = { token: "csrf" };
        else if (path === "/auth/login" || path === "/auth/refresh") result = { accessToken: "admin-token", expiresIn: 600, user: { id: 17, firstName: "Administración", lastName: "KYNEX", email: "admin@example.com", role } };
        else if (path === "/auth/me") result = { id: 17, firstName: "Administración", role };
        else if (path === "/categories") result = [{ id: 2, name: "Creatinas" }, { id: 9, name: "Especial" }];
        else if (path === "/admin/orders") result = [];
        else if (path === "/cart") result = { version: 0, items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0, canCheckout: false, warnings: [] };
        else if (path === "/products" && options.method === "GET") result = structuredClone(records);
        else if (options.method === "PUT") {
            mutations.push({ method: options.method, data, token: options.headers.Authorization });
            records = records.map(item => item.id === 2 ? { ...item, ...data.details, ...data, category: data.categoryId === 9 ? "Especial" : "Creatinas", version: item.version + 1 } : item);
            result = records[0];
        } else if (options.method === "DELETE") {
            mutations.push({ method: options.method, address, token: options.headers.Authorization }); records = [];
            return { status: 204, ok: true };
        } else if (path === "/products" && options.method === "POST") {
            mutations.push({ method: options.method, data, token: options.headers.Authorization });
            result = { ...data, ...data.details, id: 3, category: data.categoryId === 9 ? "Especial" : "Creatinas", version: 0 }; records.push(result);
        } else if (path === "/products/2") result = structuredClone(records[0]);
        else throw new Error(`Ruta no prevista ${options.method} ${path}`);
        return { ok: true, status: 200, json: async () => result };
    }));
    await apiSession.login("admin@example.com", "ClavePersonal2026!");
    await remoteCatalog.reload();
});
afterEach(() => { apiSession.invalidate(); vi.unstubAllGlobals(); window.history.replaceState({}, "", "/"); });
afterAll(() => vi.unstubAllEnvs());
function open(path) { window.history.replaceState({}, "", path); return render(<App />); }

describe("Productos conectados con autenticación", () => {
    it("edita mediante JWT, conserva metadatos y actualiza el catálogo compartido", async () => {
        open("/admin/productos/2/editar");
        const price = await screen.findByRole("spinbutton", { name: "Precio", exact: true });
        const user = userEvent.setup(); await user.clear(price); await user.type(price, "23990");
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(await screen.findByText("Producto actualizado correctamente.")).toBeInTheDocument();
        expect(mutations[0]).toMatchObject({ method: "PUT", token: "Bearer admin-token", data: { price: 23990, version: 0, image: "/media/products/creatina.png", details: { ingredients: initial.ingredients, usage: initial.usage } } });
        expect(remoteCatalog.read().products[0].price).toBe(23990);
        expect(localStorage.getItem("kynex_products")).toBeNull();
    });
    it("crea usando las categorías recibidas del servidor", async () => {
        open("/admin/productos/nuevo");
        await screen.findByRole("option", { name: "Especial" });
        const user = userEvent.setup();
        await user.type(screen.getByRole("textbox", { name: "Código", exact: true }), "NUEVO01");
        await user.type(screen.getByRole("textbox", { name: "Nombre", exact: true }), "Producto nuevo");
        await user.selectOptions(screen.getByRole("combobox", { name: "Categoría" }), "Especial");
        await user.type(screen.getByRole("spinbutton", { name: "Precio", exact: true }), "9990");
        await user.type(screen.getByRole("spinbutton", { name: "Stock", exact: true }), "4");
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(await screen.findByText("Producto creado correctamente.")).toBeInTheDocument();
        expect(mutations[0].data).toMatchObject({ categoryId: 9, name: "Producto nuevo", price: 9990, stock: 4 });
    });
    it("confirma la baja y envía la versión esperada al servidor", async () => {
        open("/admin/productos");
        await userEvent.click(await screen.findByRole("button", { name: "Eliminar Creatina del servidor" }));
        await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar producto", exact: true }));
        expect(await screen.findByText("Producto eliminado correctamente.")).toBeInTheDocument();
        expect(mutations[0]).toMatchObject({ method: "DELETE", token: "Bearer admin-token" });
        expect(mutations[0].address).toContain("/products/2?version=0");
        expect(remoteCatalog.read().products).toEqual([]);
    });
    it("restringe al Vendedor a consulta y no presenta pedidos demostrativos", async () => {
        role = "Vendedor"; await apiSession.identity();
        open("/admin/productos");
        expect(await screen.findByRole("table")).toHaveTextContent(initial.name);
        expect(screen.queryByRole("link", { name: "Nuevo producto" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("link", { name: "Pedidos", exact: true }));
        expect(await screen.findByText("No hay pedidos disponibles.")).toBeInTheDocument();
        expect(mutations).toEqual([]);
    });
});
