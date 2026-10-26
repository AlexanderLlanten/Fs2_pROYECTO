import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartProvider from "./CartContext.jsx";
import useCart from "../hooks/useCart.js";
import useCatalog from "../hooks/useCatalog.js";
import { products } from "../data/products.js";
import { PRODUCTS_KEY } from "../services/productStore.js";
import { CART_KEY } from "../utils/cart.js";

function Harness() {
    const cart = useCart(); const catalog = useCatalog();
    return <>
        <output aria-label="Cantidad">{cart.totalItems}</output><output aria-label="Subtotal">{cart.subtotal}</output>
        <output aria-label="Error">{cart.storageError}</output><output aria-label="Catálogo">{String(catalog.success)}</output>
        <button onClick={() => cart.addToCart({ id: 2, stock: 999, price: 1 })}>Agregar copia antigua</button>
        <button onClick={() => cart.addToCart({ id: 999, stock: 999 })}>Agregar inexistente</button>
        <button onClick={() => cart.addToCart({ id: 2 }, 0)}>Agregar cero</button>
        <button onClick={() => cart.increaseQuantity(2)}>Aumentar</button><button onClick={() => cart.decreaseQuantity(2)}>Disminuir</button>
    </>;
}
function renderCart() { return render(<CartProvider><Harness /></CartProvider>); }
function changeCatalog(items) {
    act(() => {
        localStorage.setItem(PRODUCTS_KEY, typeof items === "string" ? items : JSON.stringify(items));
        window.dispatchEvent(new StorageEvent("storage", { key: PRODUCTS_KEY, storageArea: localStorage }));
    });
}

describe("Carrito conectado al catálogo persistido", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());
    it("limpia referencias inexistentes y duplicadas, cantidades inválidas y exceso de stock al restaurar", () => {
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 999 }, { id: 2, quantity: 3 }, { id: 999, quantity: 1 }, null, { id: 1, quantity: 1.5 }]));
        renderCart();
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("25");
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 25 }]);
    });
    it("consulta precio y stock vigentes al agregar una copia antigua e ignora entradas inválidas", async () => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([{ ...products[1], stock: 1 }]));
        const user = userEvent.setup(); renderCart();
        await user.click(screen.getByRole("button", { name: "Agregar copia antigua" }));
        await user.click(screen.getByRole("button", { name: "Agregar copia antigua" }));
        await user.click(screen.getByRole("button", { name: "Agregar inexistente" }));
        await user.click(screen.getByRole("button", { name: "Agregar cero" }));
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("1");
        expect(screen.getByLabelText("Subtotal")).toHaveTextContent("21990");
    });
    it("aumentar o disminuir no introduce un producto que aún no está en la compra", async () => {
        const user = userEvent.setup(); renderCart();
        await user.click(screen.getByRole("button", { name: "Aumentar" }));
        await user.click(screen.getByRole("button", { name: "Disminuir" }));
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("0");
        expect(localStorage.getItem(CART_KEY)).toBe("[]");
    });
    it("actualiza precio, reduce cantidades y evita recuperar un exceso antiguo al aumentar", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":20}]');
        const user = userEvent.setup(); renderCart();
        changeCatalog([{ ...products[1], stock: 2, price: 1000 }]);
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("2");
        expect(screen.getByLabelText("Subtotal")).toHaveTextContent("2000");
        await user.click(screen.getByRole("button", { name: "Disminuir" }));
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("1");
        await user.click(screen.getByRole("button", { name: "Aumentar" }));
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 2 }]);
    });
    it("retira productos agotados o eliminados de la compra persistida", () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2},{"id":1,"quantity":1}]'); renderCart();
        changeCatalog([{ ...products[1], stock: 0 }]);
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("0");
        expect(localStorage.getItem(CART_KEY)).toBe("[]");
    });
    it("conserva la compra cuando el catálogo está dañado y la recupera al corregirlo", () => {
        const saved = '[{"id":2,"quantity":2}]';
        localStorage.setItem(CART_KEY, saved); localStorage.setItem(PRODUCTS_KEY, "{"); renderCart();
        expect(screen.getByLabelText("Catálogo")).toHaveTextContent("false");
        expect(localStorage.getItem(CART_KEY)).toBe(saved);
        changeCatalog(products);
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("2");
    });
    it.each(["{", "{}"])("recupera un carrito dañado sin bloquear la página: %s", raw => {
        localStorage.setItem(CART_KEY, raw); renderCart();
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("0");
    });
    it("informa el fallo al guardar y conserva la compra en memoria", async () => {
        const setItem = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(key, value) {
            if (key === CART_KEY) throw new DOMException("Bloqueado");
            return setItem.call(this, key, value);
        });
        const user = userEvent.setup(); renderCart();
        await user.click(screen.getByRole("button", { name: "Agregar copia antigua" }));
        expect(screen.getByLabelText("Cantidad")).toHaveTextContent("1");
        expect(screen.getByLabelText("Error")).toHaveTextContent("No fue posible guardar el carrito");
    });
});
