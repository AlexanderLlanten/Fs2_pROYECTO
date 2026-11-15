import { describe, it, expect, vi } from "vitest";
import { createAccountCart } from "./cart.js";
import { ApiError } from "./client.js";

const storage = initial => {
    const values = new Map(Object.entries(initial || {}));
    return { values, getItem: key => values.get(key) || null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) };
};
const view = (quantity = 1, version = 0) => ({ version, items: quantity ? [{ id: 2, name: "Creatina", price: 21990, stock: 25, quantity, image: "/media/products/creatina.png" }] : [], totalItems: quantity, subtotal: 21990 * quantity, shipping: quantity ? 3990 : 0, total: quantity ? 21990 * quantity + 3990 : 0, canCheckout: quantity > 0, warnings: [] });
describe("Carrito privado HTTP", () => {
    it("recupera la cuenta sin guardar sus productos en LocalStorage", async () => {
        const local = storage(); const request = vi.fn(async () => view(3));
        const cart = createAccountCart({ ownerId: 7, request, storage: local }); await cart.reload({ merge: true });
        expect(cart.read().items[0].quantity).toBe(3); expect(cart.read().items[0].image).toBe("http://localhost:8080/media/products/creatina.png");
        expect(local.values.size).toBe(0);
    });
    it("concilia al visitante y retira únicamente las unidades conciliadas", async () => {
        const local = storage({ kynex_cart: JSON.stringify([{ id: 2, quantity: 2 }]) });
        const request = vi.fn(async path => {
            if (path === "/cart/merge") { local.setItem("kynex_cart", JSON.stringify([{ id: 2, quantity: 3 }])); return view(2, 1); }
            return view(2, 1);
        });
        const cart = createAccountCart({ ownerId: 7, request, storage: local }); await cart.reload({ merge: true });
        expect(JSON.parse(local.getItem("kynex_cart"))).toEqual([{ id: 2, quantity: 1 }]);
        expect(request).toHaveBeenCalledWith("/cart/merge", expect.objectContaining({ body: { requestId: expect.any(String), items: [{ id: 2, quantity: 2 }] } }));
    });
    it("reutiliza la clave de conciliación después de perder una respuesta", async () => {
        const local = storage({ kynex_cart: JSON.stringify([{ id: 2, quantity: 1 }]) }); let calls = 0;
        const request = vi.fn(async path => { if (path === "/cart/merge" && ++calls === 1) throw new ApiError("Conexión interrumpida"); return view(1, 1); });
        const cart = createAccountCart({ ownerId: 7, request, storage: local }); await cart.reload({ merge: true }); await cart.reload({ merge: true });
        const attempts = request.mock.calls.filter(([path]) => path === "/cart/merge");
        expect(attempts[0][1].body.requestId).toBe(attempts[1][1].body.requestId);
        expect(local.getItem("kynex_cart")).toBe("[]");
    });
    it("no traslada una conciliación pendiente de otra cuenta", async () => {
        const raw = JSON.stringify([{ id: 2, quantity: 1 }]);
        const local = storage({ kynex_cart: raw, kynex_guest_merge: JSON.stringify({ ownerId: 8, raw, requestId: crypto.randomUUID() }) });
        const request = vi.fn(async () => view(0)); const cart = createAccountCart({ ownerId: 7, request, storage: local });
        await cart.reload({ merge: true }); expect(request.mock.calls.map(([path]) => path)).toEqual(["/cart"]);
        expect(local.getItem("kynex_cart")).toBe(raw);
    });
    it("conserva los avisos de ajustes de stock después de consultar el carrito", async () => {
        const request = vi.fn(async path => path === "/cart/merge" ? { ...view(1, 1), warnings: ["Cantidad ajustada al stock."] } : view(1, 1));
        const cart = createAccountCart({ ownerId: 7, request, storage: storage({ kynex_cart: JSON.stringify([{ id: 2, quantity: 50 }]) }) });
        await cart.reload({ merge: true }); expect(cart.read().warnings).toEqual(["Cantidad ajustada al stock."]);
        expect(cart.read().error).toBe("");
    });
    it("resuelve el recibo perdido antes de conciliar nuevas unidades del visitante", async () => {
        const raw = JSON.stringify([{ id: 2, quantity: 1 }]), requestId = crypto.randomUUID();
        const local = storage({ kynex_cart: JSON.stringify([{ id: 2, quantity: 3 }]), kynex_guest_merge: JSON.stringify({ ownerId: 7, raw, requestId }) });
        const request = vi.fn(async () => view(1, 1));
        const cart = createAccountCart({ ownerId: 7, request, storage: local }); await cart.reload({ merge: true });
        expect(request.mock.calls[0][1].body).toEqual({ requestId, items: [{ id: 2, quantity: 1 }] });
        expect(JSON.parse(local.getItem("kynex_cart"))).toEqual([{ id: 2, quantity: 2 }]);
    });
    it("envía cantidades absolutas y la versión vigente", async () => {
        const request = vi.fn(async (path, options) => path === "/cart" ? view(1, 3) : view(options.body.quantity, 4));
        const cart = createAccountCart({ ownerId: 7, request, storage: storage() }); await cart.reload();
        expect(await cart.add({ id: 2 }, 2)).toEqual({ success: true });
        expect(request).toHaveBeenCalledWith("/cart/items/2", { method: "PUT", body: { quantity: 3, version: 3 } });
    });
    it("recupera un conflicto sin sobrescribir el cambio de otra pestaña", async () => {
        let changed = false; const request = vi.fn(async path => { if (path !== "/cart") { changed = true; throw new ApiError("Carrito modificado", 409); } return view(changed ? 4 : 1, changed ? 2 : 1); });
        const cart = createAccountCart({ ownerId: 7, request, storage: storage() }); await cart.reload();
        expect((await cart.increase(2)).success).toBe(false); expect(cart.read().items[0].quantity).toBe(4);
        expect(cart.read().error).toBe("Carrito modificado"); await cart.reload(); expect(cart.read().error).toBe("");
    });
    it("distingue una caída del servidor de un carrito vacío", async () => {
        const cart = createAccountCart({ ownerId: 7, request: async () => { throw new ApiError("Servidor desconectado"); }, storage: storage() });
        await cart.reload(); expect(cart.read()).toMatchObject({ loadError: true, error: "Servidor desconectado", canCheckout: false });
    });
});
