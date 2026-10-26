import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { products } from "./data/products.js";
import { loginUser } from "./services/auth.js";
import { PRODUCTS_KEY } from "./services/productStore.js";
import { saveManagedProduct } from "./services/adminProducts.js";
import { CART_KEY } from "./utils/cart.js";
import { fillProduct, productData } from "./test/product.js";

function openPage(path = "/admin/productos", email = "admin@profesor.duoc.cl") {
    if (email) loginUser(email, "1234");
    window.history.replaceState({}, "", path); return render(<App />);
}
function changeCatalog(items) {
    act(() => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
        window.dispatchEvent(new StorageEvent("storage", { key: PRODUCTS_KEY, storageArea: localStorage }));
    });
}

describe("Gestión de productos integrada", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });
    it.each(["/admin/productos", "/admin/productos/nuevo", "/admin/productos/1/editar"])("exige sesión en %s", path => {
        openPage(path, null);
        expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
    });
    it("permite consultar al Vendedor y bloquea el acceso directo al formulario", () => {
        const first = openPage("/admin/productos", "martin@duoc.cl");
        expect(screen.getByRole("table")).toHaveTextContent("KYN001");
        expect(screen.queryByRole("link", { name: "Nuevo producto" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();
        first.unmount(); window.history.replaceState({}, "", "/admin/productos/1/editar"); render(<App />);
        expect(screen.getByRole("heading", { level: 1, name: "Panel de administración" })).toBeInTheDocument();
        expect(screen.queryByRole("form")).not.toBeInTheDocument();
    });
    it("retorna al formulario solicitado después del Login", async () => {
        const user = userEvent.setup(); openPage("/admin/productos/1/editar", null);
        await user.click(screen.getByRole("textbox", { name: "Correo electrónico" })); await user.paste("admin@profesor.duoc.cl");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { level: 1, name: "Editar producto" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/admin/productos/1/editar");
    });
    it("crea, persiste y publica el producto en su detalle y categoría", async () => {
        const user = userEvent.setup(); openPage();
        await user.click(screen.getByRole("link", { name: "Nuevo producto" })); await fillProduct(user);
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(await screen.findByRole("heading", { level: 1, name: "Productos" })).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Producto creado correctamente");
        expect(screen.getByRole("row", { name: /Producto de prueba/ })).toHaveTextContent("Aminoácidos");
        await user.click(screen.getByRole("link", { name: `Ver ${productData.name}` }));
        expect(screen.getByRole("heading", { level: 1, name: productData.name })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(PRODUCTS_KEY))).toHaveLength(7);
        await user.click(screen.getByRole("link", { name: "Volver al catálogo" }));
        await user.selectOptions(screen.getByRole("combobox", { name: /Filtrar por categoría/i }), "Aminoácidos");
        expect(screen.getAllByRole("article")).toHaveLength(1);
    });
    it("edita precio y stock, actualiza el carrito y restaura el cambio al recargar", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":10}]');
        const user = userEvent.setup(); const first = openPage("/admin/productos/2/editar");
        const price = screen.getByRole("spinbutton", { name: "Precio" });
        const stock = screen.getByRole("spinbutton", { name: "Stock", exact: true });
        await user.clear(price); await user.type(price, "1000"); await user.clear(stock); await user.type(stock, "2");
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(await screen.findByRole("heading", { level: 1, name: "Productos" })).toBeInTheDocument();
        expect(localStorage.getItem(CART_KEY)).toBe('[{"id":2,"quantity":2}]');
        first.unmount(); window.history.replaceState({}, "", "/carrito"); render(<App />);
        expect(screen.getByRole("heading", { name: "Creatina Monohidratada" })).toBeInTheDocument();
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("2");
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(PRODUCTS_KEY)).find(product => product.id === 2)).toMatchObject({ price: 1000, stock: 2, featured: true });
    });
    it("cancela y confirma la eliminación, retira la compra y devuelve el foco", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":1}]');
        const user = userEvent.setup(); openPage();
        const trigger = screen.getByRole("button", { name: "Eliminar Creatina Monohidratada" });
        await user.click(trigger); expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
        await user.click(screen.getByRole("button", { name: "Cancelar" })); expect(trigger).toHaveFocus();
        expect(screen.getByRole("row", { name: /Creatina Monohidratada/ })).toBeInTheDocument();
        await user.click(trigger); await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar producto" }));
        expect(screen.queryByRole("row", { name: /Creatina Monohidratada/ })).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Producto eliminado correctamente");
        expect(localStorage.getItem(CART_KEY)).toBe("[]");
    });
    it("conserva el borrador y exige recargar si otra pestaña cambia el producto", async () => {
        const user = userEvent.setup(); openPage("/admin/productos/1/editar");
        const name = screen.getByRole("textbox", { name: "Nombre", exact: true });
        await user.type(name, " borrador");
        changeCatalog(products.map(product => product.id === 1 ? { ...product, name: "Nombre externo" } : product));
        expect(name).toHaveValue("Whey Protein Performance borrador");
        expect(screen.getByRole("button", { name: "Guardar producto" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Recargar datos" }));
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue("Nombre externo");
        expect(screen.getByRole("button", { name: "Guardar producto" })).toBeEnabled();
    });
    it.each(["999", "invalido"])("informa un id inexistente sin ofrecer guardar: %s", id => {
        openPage(`/admin/productos/${id}/editar`);
        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible encontrar");
        expect(screen.queryByRole("form")).not.toBeInTheDocument();
    });
    it("conserva la fila y anuncia un fallo al persistir una eliminación", async () => {
        const user = userEvent.setup(); openPage();
        const setItem = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(key, value) {
            if (key === PRODUCTS_KEY) throw new DOMException("Sin espacio");
            return setItem.call(this, key, value);
        });
        await user.click(screen.getByRole("button", { name: "Eliminar Creatina Monohidratada" }));
        await user.click(screen.getByRole("button", { name: "Eliminar producto" }));
        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible guardar");
        expect(screen.getByRole("row", { name: /Creatina Monohidratada/ })).toBeInTheDocument();
    });
    it("comparte cambios del servicio con el inicio y el resumen del panel sin recargar", () => {
        const first = openPage("/");
        act(() => { saveManagedProduct({ ...products[1], name: "Creatina actualizada", stock: 1 }, { id: 2 }); });
        expect(screen.getByRole("heading", { name: "Creatina actualizada" })).toBeInTheDocument();
        first.unmount(); window.history.replaceState({}, "", "/admin"); render(<App />);
        expect(screen.getByRole("article", { name: "Unidades en stock" })).toHaveTextContent("98");
        expect(screen.getByRole("article", { name: "Productos con stock bajo" })).toHaveTextContent("1");
    });
    it("muestra el fallo del catálogo sin borrar la compra y permite reintentar", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]'); localStorage.setItem(PRODUCTS_KEY, "{");
        const user = userEvent.setup(); openPage("/carrito", null);
        expect(screen.getByRole("alert")).toHaveTextContent("No se modificaron tus datos");
        expect(localStorage.getItem(CART_KEY)).toBe('[{"id":2,"quantity":2}]');
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        await user.click(screen.getByRole("button", { name: "Reintentar catálogo" }));
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("2");
    });
});
