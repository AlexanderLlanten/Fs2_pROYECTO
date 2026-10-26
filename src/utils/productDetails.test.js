import { describe, expect, it } from "vitest";
import { products } from "../data/products.js";
import { products as originalProducts } from "../../assets/js/data/products.js";
import { completeProductDetails, productCalories, productList, productRecord, productText } from "./productDetails.js";

describe("Paridad de datos del catálogo", () => {
    it("conserva todos los campos de los seis productos originales", () => {
        expect(products).toEqual(originalProducts);
    });
    it("completa solo datos ausentes sin mutar el registro ni los originales", () => {
        const saved = { id: 1, code: "KYN001", name: "Nombre editado", price: 123, stock: 2, description: "Texto editado" };
        const result = completeProductDetails(saved);
        expect(result).toMatchObject({ ...saved, ingredients: products[0].ingredients, nutrition: products[0].nutrition });
        expect(saved).not.toHaveProperty("ingredients");
        result.ingredients.push("Cambio en copia"); expect(products[0].ingredients).not.toContain("Cambio en copia");
    });
    it("respeta vacíos explícitos, null y objetos parciales", () => {
        const saved = { id: 1, code: "KYN001", ingredients: [], allergens: null, warning: "", nutrition: { calories: 0 }, usage: {} };
        expect(completeProductDetails(saved)).toMatchObject(saved);
        expect(completeProductDetails(saved).nutrition).not.toHaveProperty("protein");
    });
    it("no atribuye fichas originales a otros ids o códigos", () => {
        for (const product of [{ id: 99, code: "KYN001" }, { id: 1, code: "OTRO" }]) expect(completeProductDetails(product)).toEqual(product);
    });
    it("presenta metadatos incompletos o dañados como información no especificada", () => {
        expect(productText("  Dato  ")).toBe("Dato"); expect(productText({ text: "No mostrar" })).toBe("No especificado");
        expect(productText(null, "Sin especificar")).toBe("Sin especificar");
        expect(productList(["", "  Texto  ", null, {}, 3])).toEqual(["Texto"]); expect(productList("Texto")).toEqual([]);
        expect(productRecord([])).toEqual({}); expect(productRecord(null)).toEqual({}); expect(productRecord({ serving: "5 g" })).toEqual({ serving: "5 g" });
    });
    it("conserva cero calorías y no inventa un valor para datos ausentes o inválidos", () => {
        for (const value of [0, "0"]) expect(productCalories(value)).toBe("0 kcal");
        expect(productCalories(120)).toBe("120 kcal");
        for (const value of [null, undefined, "", " ", -1, "abc", Infinity, {}]) expect(productCalories(value)).toBe("No especificado");
    });
});
