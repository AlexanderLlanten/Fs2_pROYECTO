import { products } from "../data/products.js";

const detailFields = ["goals", "dietaryTags", "allergens", "ingredients", "benefits", "usage", "nutrition", "certifications", "warning"];

// Completa solo campos ausentes del catálogo React anterior. Las ediciones explícitas
// (incluidos [], null y objetos parciales) tienen prioridad sobre la ficha original.
export function completeProductDetails(product) {
    const original = products.find(item => item.id === product.id && item.code === product.code);
    const result = { ...product };
    if (original) for (const field of detailFields) {
        if (!Object.hasOwn(product, field)) result[field] = structuredClone(original[field]);
    }
    return result;
}

export const productText = (value, fallback = "No especificado") => typeof value === "string" && value.trim() ? value.trim() : fallback;
export const productList = value => Array.isArray(value) ? value.filter(item => typeof item === "string" && item.trim()).map(item => item.trim()) : [];
export const productRecord = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};

export function productCalories(value) {
    return ["number", "string"].includes(typeof value) && String(value).trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
        ? `${Number(value)} kcal` : "No especificado";
}
