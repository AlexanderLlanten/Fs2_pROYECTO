/*
 * Pruebas automatizadas.
 * Pruebas de adminProducts. Casos: «lee el catálogo inicial sin escribir y conserva un catálogo
 * vacío»; «crea con identidad propia e informa el cambio a los consumidores».
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { products } from "../data/products.js";
import { defaultUsers } from "../data/users.js";
import { loginUser, SESSION_KEY, USERS_KEY } from "./auth.js";
import { deleteManagedProduct, getManagedProduct, saveManagedProduct } from "./adminProducts.js";
import { PRODUCTS_KEY, readCatalog, subscribeCatalog } from "./productStore.js";

const input = { ...products[0], code: "KYN007", name: "Producto nuevo", image: "" };
const stored = () => JSON.parse(localStorage.getItem(PRODUCTS_KEY));

describe("Persistencia y administración de productos", () => {
    beforeEach(() => { localStorage.clear(); loginUser("admin@profesor.duoc.cl", "1234"); });
    afterEach(() => vi.restoreAllMocks());
    it("lee el catálogo inicial sin escribir y conserva un catálogo vacío", () => {
        expect(readCatalog().products).toHaveLength(6);
        expect(localStorage.getItem(PRODUCTS_KEY)).toBeNull();
        localStorage.setItem(PRODUCTS_KEY, "[]");
        expect(readCatalog()).toEqual({ success: true, products: [] });
    });
    it.each(["{", "{}", "null", '[{"id":1}]'])("rechaza almacenamiento dañado sin reemplazarlo: %s", raw => {
        localStorage.setItem(PRODUCTS_KEY, raw);
        expect(readCatalog().code).toBe("CORRUPTED");
        expect(saveManagedProduct(input).code).toBe("CORRUPTED");
        expect(localStorage.getItem(PRODUCTS_KEY)).toBe(raw);
    });
    it.each(["id", "code"])("rechaza productos con %s duplicado", key => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([products[0], { ...products[1], [key]: products[0][key] }]));
        expect(readCatalog().code).toBe("CORRUPTED");
    });
    it("crea con identidad propia e informa el cambio a los consumidores", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeCatalog(listener);
        const result = saveManagedProduct({ ...input, id: 1, featured: true, price: 0, stock: 0, criticalStock: null, code: " kyn007 " });
        expect(result.success).toBe(true);
        expect(result.product).toMatchObject({ code: "KYN007", price: 0, stock: 0, criticalStock: null, featured: false });
        expect(result.product.id).not.toBe(1);
        expect(stored()).toHaveLength(7);
        expect(listener).toHaveBeenCalledOnce();
        unsubscribe();
    });
    it("preserva todos los metadatos heredados al editar y actualiza el slug", () => {
        const original = { ...products[0], ingredients: ["Prueba"], usage: { serving: "1 medida" }, nutrition: { protein: "24 g" } };
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([original]));
        const result = saveManagedProduct({ ...input, name: "Proteína Especial" }, { id: 1 });
        expect(result.product).toMatchObject({ id: 1, slug: "proteina-especial", featured: true, ingredients: ["Prueba"], usage: original.usage, nutrition: original.nutrition, format: "2 lb" });
        expect(stored()).toHaveLength(1);
    });
    it("rechaza duplicados de código sin distinguir mayúsculas y permite conservar el propio", () => {
        expect(saveManagedProduct({ ...input, code: " kyn001 " }).errors).toHaveProperty("code");
        expect(saveManagedProduct(products[0], { id: 1 }).success).toBe(true);
    });
    it("valida en el servicio aunque se omita el formulario", () => {
        expect(saveManagedProduct({ ...input, stock: 1.5, price: "", category: "Desconocida" }).errors)
            .toMatchObject({ stock: expect.any(String), price: expect.any(String), category: expect.any(String) });
        expect(localStorage.getItem(PRODUCTS_KEY)).toBeNull();
    });
    it.each(["camila@gmail.com", "martin@duoc.cl"])("deniega todas las modificaciones a %s", email => {
        loginUser(email, "1234");
        expect(getManagedProduct(1).code).toBe("FORBIDDEN");
        expect(saveManagedProduct(input).code).toBe("FORBIDDEN");
        expect(deleteManagedProduct(1).code).toBe("FORBIDDEN");
        expect(localStorage.getItem(PRODUCTS_KEY)).toBeNull();
    });
    it("revisa el rol vigente y deniega una sesión ausente o revocada", () => {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 3 ? { ...user, role: "Cliente" } : user)));
        expect(saveManagedProduct(input).code).toBe("FORBIDDEN");
        localStorage.removeItem(SESSION_KEY);
        expect(deleteManagedProduct(1).code).toBe("FORBIDDEN");
    });
    it.each([null, -1, "1", 999])("no recrea un producto inexistente al editar o eliminar: %s", id => {
        expect(getManagedProduct(id).code).toBe("NOT_FOUND");
        expect(saveManagedProduct(input, { id }).code).toBe("NOT_FOUND");
        expect(deleteManagedProduct(id).code).toBe("NOT_FOUND");
    });
    it("detecta cambios desde que se abrió el producto antes de editar o eliminar", () => {
        const expectedProduct = getManagedProduct(1).product;
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products.map(product => product.id === 1 ? { ...product, stock: 1 } : product)));
        const raw = localStorage.getItem(PRODUCTS_KEY);
        expect(saveManagedProduct(input, { id: 1, expectedProduct }).code).toBe("CONFLICT");
        expect(deleteManagedProduct(1, expectedProduct).code).toBe("CONFLICT");
        expect(localStorage.getItem(PRODUCTS_KEY)).toBe(raw);
    });
    it("elimina y conserva vacío sin reponer los productos iniciales", () => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([products[0]]));
        expect(deleteManagedProduct(1, getManagedProduct(1).product).success).toBe(true);
        expect(stored()).toEqual([]);
        expect(readCatalog().products).toEqual([]);
    });
    it("preserva los datos anteriores cuando falla una escritura", () => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        const raw = localStorage.getItem(PRODUCTS_KEY);
        const setItem = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(key, value) {
            if (key === PRODUCTS_KEY) throw new DOMException("Sin espacio");
            return setItem.call(this, key, value);
        });
        expect(saveManagedProduct(input).code).toBe("STORAGE");
        expect(deleteManagedProduct(1).code).toBe("STORAGE");
        expect(localStorage.getItem(PRODUCTS_KEY)).toBe(raw);
    });
    it("informa fallos de lectura y admite reintentar al recuperar el almacenamiento", () => {
        const getItem = Storage.prototype.getItem;
        const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(function(key) {
            if (key === PRODUCTS_KEY) throw new DOMException("Bloqueado");
            return getItem.call(this, key);
        });
        expect(readCatalog().code).toBe("STORAGE");
        expect(getManagedProduct(1).code).toBe("STORAGE");
        spy.mockRestore();
        expect(readCatalog().success).toBe(true);
    });
    it("escucha productos y limpieza entre pestañas, e ignora otras claves", () => {
        const listener = vi.fn(); const unsubscribe = subscribeCatalog(listener);
        for (const key of [PRODUCTS_KEY, null, "otra"]) window.dispatchEvent(new StorageEvent("storage", { key, storageArea: localStorage }));
        expect(listener).toHaveBeenCalledTimes(2);
        unsubscribe();
        window.dispatchEvent(new StorageEvent("storage", { key: PRODUCTS_KEY }));
        expect(listener).toHaveBeenCalledTimes(2);
    });
});
