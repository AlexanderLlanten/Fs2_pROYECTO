/*
 * Reglas y funciones auxiliares.
 * Completa información ausente solo si coinciden id y código con el producto original. Conserva
 * valores explícitos y prepara textos, listas, objetos y calorías para presentación.
 */

import { products } from "../data/products.js";

const detailFields = ["goals", "dietaryTags", "allergens", "ingredients", "benefits", "usage", "nutrition", "certifications", "warning"];

// Completa solo campos ausentes del catálogo React anterior. Las ediciones explícitas
// (incluidos [], null y objetos parciales) tienen prioridad sobre la ficha original.
// Completa metadatos ausentes del producto original solo cuando coinciden id y código. Conserva
// valores explícitos y copia datos anidados.
export function completeProductDetails(product) {
    const original = products.find(item => item.id === product.id && item.code === product.code);
    const result = { ...product };
    if (original) for (const field of detailFields) {
        // Solo se completa una propiedad ausente. Un valor explícito como [], null o cero conserva su
        // significado; structuredClone independiza los datos anidados.
        if (!Object.hasOwn(product, field)) result[field] = structuredClone(original[field]);
    }
    return result;
}

// Devuelve texto no vacío y recortado, o un mensaje alternativo cuando el dato no es utilizable.
export const productText = (value, fallback = "No especificado") => typeof value === "string" && value.trim() ? value.trim() : fallback;
// Conserva únicamente cadenas no vacías de una lista y retira espacios exteriores.
export const productList = value => Array.isArray(value) ? value.filter(item => typeof item === "string" && item.trim()).map(item => item.trim()) : [];
// Acepta un objeto de datos y sustituye valores inválidos o arreglos por un objeto vacío.
export const productRecord = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};

// Presenta calorías válidas y no negativas, incluido cero; devuelve un mensaje cuando faltan o son
// inválidas.
export function productCalories(value) {
    return ["number", "string"].includes(typeof value) && String(value).trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
        ? `${Number(value)} kcal` : "No especificado";
}
