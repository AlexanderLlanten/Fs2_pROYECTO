import { describe, expect, it } from "vitest";
import { getProductErrors, isCriticalStock, normalizeProduct, parseProductId, productImageSource } from "./products.js";
import { products } from "../data/products.js";

describe("Validación del catálogo", () => {
    it("normaliza código, espacios, números y umbral opcional conservando valores cero", () => {
        expect(normalizeProduct({ ...products[0], code: " kyn007 ", name: " Nuevo ", price: "0", stock: "0", criticalStock: "" }))
            .toMatchObject({ code: "KYN007", name: "Nuevo", price: 0, stock: 0, criticalStock: null });
        expect(getProductErrors({ ...products[0], price: 0, stock: 0, criticalStock: 0 })).toEqual({});
    });
    it.each(["", " ", -1, Infinity, NaN])("rechaza precio inválido %s", price => {
        expect(getProductErrors({ ...products[0], price })).toHaveProperty("price");
    });
    it("exige enteros no negativos para existencias y acepta precio decimal", () => {
        expect(getProductErrors({ ...products[0], price: 12.5, stock: 1.5, criticalStock: -1 }))
            .toEqual({ stock: expect.any(String), criticalStock: expect.any(String) });
        expect(getProductErrors({ ...products[0], stock: "", criticalStock: "no" })).toHaveProperty("stock");
    });
    it("valida campos obligatorios, categorías y límites de texto", () => {
        expect(Object.keys(getProductErrors({}))).toEqual(["code", "category", "name", "price", "stock"]);
        expect(getProductErrors({ ...products[0], code: "AA", category: "Inválida", name: "x".repeat(101), description: "x".repeat(501) }))
            .toEqual({ code: expect.any(String), category: expect.any(String), name: expect.any(String), description: expect.any(String) });
        expect(getProductErrors({ ...products[0], name: "x".repeat(100), description: "x".repeat(500) })).toEqual({});
    });
    it("admite imágenes web y convierte rutas heredadas de recursos", () => {
        expect(productImageSource("../../assets/img/producto.jpg")).toBe("/assets/img/producto.jpg");
        expect(productImageSource("/assets/img/producto.jpg")).toBe("/assets/img/producto.jpg");
        expect(productImageSource("https://example.com/producto.jpg")).toBe("https://example.com/producto.jpg");
        for (const image of ["javascript:alert(1)", "file:///C:/privado", "data:image/png,abc", "imagen-invalida"]) {
            expect(getProductErrors({ ...products[0], image })).toHaveProperty("image");
        }
    });
    it("no interpreta un umbral ausente como cero", () => {
        expect(isCriticalStock({ stock: 0, criticalStock: null })).toBe(false);
        expect(isCriticalStock({ stock: 0, criticalStock: 0 })).toBe(true);
        expect(isCriticalStock({ stock: 5, criticalStock: 5 })).toBe(true);
        expect(isCriticalStock({ stock: 6, criticalStock: 5 })).toBe(false);
    });
    it("acepta solo identificadores enteros positivos completos", () => {
        expect(parseProductId("123")).toBe(123);
        for (const value of ["1abc", "1.5", "1e2", "", 0, -1, undefined, "9007199254740992"]) expect(parseProductId(value)).toBeNull();
    });
});
