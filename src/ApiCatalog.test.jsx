import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => vi.stubEnv("VITE_CATALOG_SOURCE", "api"));
import ProductsPage from "./pages/ProductsPage.jsx";
import CartProvider from "./context/CartContext.jsx";
import { remoteCatalog } from "./services/api/catalogStore.js";

const product = { id: 22, code: "API022", name: "Producto desde PostgreSQL", category: "Nueva categoría", description: "Catálogo del servidor", price: 21990, stock: 8, image: "/media/products/creatina.png" };

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
afterAll(() => vi.unstubAllEnvs());
describe("Catálogo conectado", () => {
    it("muestra la respuesta HTTP y permite agregar al carrito conservando el diseño", async () => {
        localStorage.setItem("kynex_products", "datos locales inválidos que no deben consultarse");
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [product] }));
        await remoteCatalog.reload();
        render(<MemoryRouter><CartProvider><ProductsPage /></CartProvider></MemoryRouter>);
        expect(await screen.findByText(product.name)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /agregar/i }));
        await waitFor(() => expect(JSON.parse(localStorage.getItem("kynex_cart"))).toEqual([{ id: 22, quantity: 1 }]));
        expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/v1/products", expect.any(Object));
    });
    it("presenta carga, comunica la caída y permite reintentar sin catálogo demostrativo", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
        const loading = remoteCatalog.reload();
        render(<MemoryRouter><CartProvider><ProductsPage /></CartProvider></MemoryRouter>);
        expect(screen.getByRole("status")).toHaveTextContent("Cargando catálogo");
        await loading;
        expect(await screen.findByRole("alert")).toHaveTextContent("No fue posible conectar");
        expect(screen.queryByText("Whey Protein Performance")).not.toBeInTheDocument();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [product] }));
        await userEvent.click(screen.getByRole("button", { name: "Reintentar catálogo" }));
        expect(await screen.findByText(product.name)).toBeInTheDocument();
    });
});
