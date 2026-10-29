/*
 * Pruebas automatizadas.
 * Pruebas de integración. Información ampliada, imágenes y cantidades del catálogo comparadas con los
 * comportamientos esperados.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { products } from "./data/products.js";
import { PRODUCTS_KEY, readCatalog } from "./services/productStore.js";
import { CART_KEY } from "./utils/cart.js";
import { loginUser, SESSION_KEY } from "./services/auth.js";
import { saveManagedProduct } from "./services/adminProducts.js";

function openPage(path = "/productos/2") { window.history.replaceState({}, "", path); return render(<App />); }
function changeCatalog(next) {
    act(() => { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next)); window.dispatchEvent(new StorageEvent("storage", { key: PRODUCTS_KEY, storageArea: localStorage })); });
}

describe("Paridad del catálogo y detalle", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });
    it("reutiliza imágenes originales en Inicio, catálogo y detalle y conserva las selecciones", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]'); const user = userEvent.setup(); openPage("/");
        expect(within(screen.getByRole("region", { name: "Productos destacados" })).getAllByRole("img")).toHaveLength(3);
        await user.click(within(screen.getByRole("banner")).getByRole("link", { name: "Tienda" }));
        const card = screen.getByRole("heading", { name: "Creatina Monohidratada" }).closest("article");
        expect(within(card).getByRole("img")).toBeInTheDocument(); expect(within(card).getByText("Fuerza")).toBeInTheDocument();
        await user.click(within(card).getByRole("link", { name: "Ver detalle" }));
        expect(screen.getByRole("region", { name: "Ingredientes" })).toHaveTextContent("Creatina monohidratada");
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
    });
    it("completa el catálogo React anterior sin reemplazar precio, stock ni almacenamiento", () => {
        const raw = JSON.stringify([{ id: 2, code: "KYN002", name: "Creatina editada", category: "Creatinas", price: 1234, stock: 7, criticalStock: 2, image: "", description: "Descripción editada" }]);
        localStorage.setItem(PRODUCTS_KEY, raw); const write = vi.spyOn(Storage.prototype, "setItem"); openPage();
        expect(screen.getByRole("heading", { level: 1, name: "Creatina editada" })).toBeInTheDocument();
        expect(screen.getByText("$1.234")).toBeInTheDocument(); expect(screen.getByText("7 unidades")).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Ingredientes" })).toHaveTextContent("Creatina monohidratada");
        expect(screen.getByRole("row", { name: "Calorías 0 kcal" })).toBeInTheDocument();
        expect(localStorage.getItem(PRODUCTS_KEY)).toBe(raw);
        expect(write.mock.calls.filter(([key]) => key === PRODUCTS_KEY)).toHaveLength(0);
    });
    it("respeta vacíos y metadatos personalizados al editar y recargar", () => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([{ ...products[1], ingredients: [], allergens: null, nutrition: { calories: 0 }, usage: {}, warning: "Nota personalizada", image: "/assets/personalizada.png" }]));
        loginUser("admin@profesor.duoc.cl", "1234");
        const current = readCatalog().products[0];
        expect(saveManagedProduct({ ...current, price: 999 }, { id: 2, expectedProduct: current }).success).toBe(true);
        const view = openPage(); view.unmount(); openPage();
        expect(screen.getByRole("region", { name: "Ingredientes" })).toHaveTextContent("No especificado");
        expect(screen.getByRole("region", { name: "Alérgenos" })).toHaveTextContent("No se dispone de información");
        expect(screen.getByRole("row", { name: "Proteínas No especificado" })).toBeInTheDocument();
        expect(screen.getByText("Nota personalizada")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Creatina Monohidratada" })).toHaveAttribute("src", "/assets/personalizada.png");
    });
    it("elige de una a diez unidades y agrega la cantidad elegida con el total correcto", async () => {
        const user = userEvent.setup(); openPage(); const plus = screen.getByRole("button", { name: "Aumentar cantidad" });
        expect(screen.getByRole("button", { name: "Disminuir cantidad" })).toBeDisabled();
        for (let i = 0; i < 10; i++) await user.click(plus);
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("10"); expect(plus).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
        expect(screen.getByText("10 productos agregados al carrito.")).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 10 }]);
        await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("9");
        await user.click(screen.getByRole("link", { name: "Ver carrito" }));
        expect(screen.getByRole("link", { name: "Carrito (10)" })).toBeInTheDocument();
    });
    it("reduce la selección al stock que queda tras cambios de catálogo y no anuncia unidades de más", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":20}]'); const user = userEvent.setup(); openPage();
        const plus = screen.getByRole("button", { name: "Aumentar cantidad" });
        await user.click(plus); await user.click(plus); await user.click(plus);
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("4");
        changeCatalog([{ ...products[1], stock: 22, price: 900 }]);
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("2"); expect(plus).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
        expect(screen.getByText("2 productos agregados al carrito.")).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 22 }]);
        expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeDisabled();
        expect(screen.getByText("Ya tienes todo el stock disponible en tu carrito.")).toBeInTheDocument();
    });
    it("bloquea la compra de un agotado y admite un producto nuevo sin ficha", () => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([{ id: 99, code: "NUEVO", name: "Producto nuevo", category: "Otros", price: 100, stock: 0, description: "" }]));
        openPage("/productos/99");
        expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeDisabled();
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("0");
        expect(screen.getByRole("region", { name: "Ingredientes" })).toHaveTextContent("No especificado");
        expect(screen.getByRole("region", { name: "Alérgenos" })).toHaveTextContent("No se dispone de información");
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
    it("reinicia cantidad y aviso al cambiar el id dentro de la misma ruta de detalle", async () => {
        const user = userEvent.setup(); openPage();
        await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
        await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
        expect(screen.getByText("2 productos agregados al carrito.")).toBeInTheDocument();
        act(() => { window.history.pushState({}, "", "/productos/1"); window.dispatchEvent(new PopStateEvent("popstate")); });
        expect(screen.getByRole("heading", { level: 1, name: "Whey Protein Performance" })).toBeInTheDocument();
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("1");
        expect(screen.queryByText("2 productos agregados al carrito.")).not.toBeInTheDocument();
    });
    it("no interpreta notación numérica alternativa como un id válido ni monta la ficha", () => {
        openPage("/productos/2e0"); expect(screen.getByRole("heading", { name: "Producto no encontrado" })).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument(); expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
});
