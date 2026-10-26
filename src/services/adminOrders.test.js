import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listManagedOrders, getManagedOrder } from "./adminOrders.js";
import { loginUser, USERS_KEY, SESSION_KEY } from "./auth.js";
import { defaultUsers } from "../data/users.js";
import { products } from "../data/products.js";
import { saveManagedProduct, deleteManagedProduct } from "./adminProducts.js";

describe("Consulta protegida de pedidos", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());
    it.each(["admin@profesor.duoc.cl", "martin@duoc.cl"])("permite consultar lista y detalle a %s sin escribir", email => {
        loginUser(email, "1234"); const write = vi.spyOn(Storage.prototype, "setItem");
        expect(listManagedOrders().orders).toHaveLength(3);
        expect(getManagedOrder(1002).order).toMatchObject({ id: 1002, date: "2026-09-29", status: "Despachado", quantity: 2, total: 69980 });
        expect(write).not.toHaveBeenCalled();
    });
    it.each([null, "camila@gmail.com"])("deniega lista y detalle sin permiso: %s", email => {
        if (email) loginUser(email, "1234");
        expect(listManagedOrders()).toMatchObject({ success: false, code: "FORBIDDEN" });
        expect(listManagedOrders()).not.toHaveProperty("orders");
        expect(getManagedOrder(1001)).not.toHaveProperty("order");
        expect(getManagedOrder(999).code).toBe("FORBIDDEN");
    });
    it("consulta el rol vigente aunque la sesión guardada todavía diga Administrador", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 3 ? { ...user, role: "Cliente" } : user)));
        expect(JSON.parse(localStorage.getItem(SESSION_KEY)).role).toBe("Administrador");
        expect(listManagedOrders().code).toBe("FORBIDDEN");
    });
    it("deniega una identidad o un rol que ya no son válidos", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 3 ? { ...user, role: "Desconocido" } : user)));
        expect(getManagedOrder(1001).code).toBe("FORBIDDEN");
        localStorage.setItem(USERS_KEY, "[]");
        expect(listManagedOrders().code).toBe("FORBIDDEN");
    });
    it("informa un identificador inexistente sin devolver otro pedido", () => {
        loginUser("martin@duoc.cl", "1234");
        for (const id of [999, -1, 0, null, "1001"]) expect(getManagedOrder(id)).toMatchObject({ success: false, code: "NOT_FOUND" });
    });
    it("entrega copias que no permiten modificar los datos originales por referencia", () => {
        loginUser("martin@duoc.cl", "1234");
        const first = getManagedOrder(1001).order;
        first.customer.name = "Alterado"; first.products[0].price = 1; first.products.push({ name: "Ajeno" });
        expect(getManagedOrder(1001).order).toMatchObject({ customer: { name: "Camila Soto Pérez" }, total: 61980 });
        expect(getManagedOrder(1001).order.products).toHaveLength(2);
    });
    it("conserva productos e importes históricos si se edita o elimina el catálogo actual", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        expect(saveManagedProduct({ ...products[0], name: "Nombre actualizado", price: 1 }, { id: 1 }).success).toBe(true);
        expect(deleteManagedProduct(2).success).toBe(true);
        const order = getManagedOrder(1001).order;
        expect(order).toMatchObject({ total: 61980, quantity: 2 });
        expect(order.products[0]).toMatchObject({ name: "Whey Protein Performance", price: 39990 });
        expect(order.products[1]).toMatchObject({ name: "Creatina Monohidratada", price: 21990 });
    });
    it("no revela datos si el almacenamiento impide verificar la sesión", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Bloqueado"); });
        expect(listManagedOrders()).toMatchObject({ success: false, code: "FORBIDDEN" });
        expect(getManagedOrder(1001)).not.toHaveProperty("order");
    });
});
