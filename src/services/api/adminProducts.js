import { api } from "./client.js";
import { apiSession } from "./session.js";
import { remoteCatalog } from "./catalogStore.js";

const apiOrigin = new URL(import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1").origin;
const detailKeys = ["slug", "brand", "format", "flavor", "goals", "dietaryTags", "allergens", "ingredients", "benefits", "usage", "nutrition", "certifications", "warning", "icon"];
const failure = error => ({ success: false, message: error.message, code: error.status === 409 ? "CONFLICT" : error.status === 404 ? "NOT_FOUND" : "API",
    errors: error.errors ? Object.fromEntries(Object.entries(error.errors).map(([key,value]) => [key === "categoryId" ? "category" : key, value])) : undefined });

export async function getRemoteProduct(id) {
    if (!Number.isSafeInteger(id) || id <= 0) return { success: false, code: "NOT_FOUND", message: "No fue posible encontrar el producto solicitado." };
    try {
        const product = await apiSession.authorized(`/products/${id}`);
        if (product.image?.startsWith("/media/products/")) product.image = apiOrigin + product.image;
        return { success: true, product };
    } catch (error) { return failure(error); }
}
export async function saveRemoteProduct(values, { id, expectedProduct } = {}) {
    try {
        const categories = await api("/categories");
        const category = categories.find(item => item.name === values.category);
        if (!category) return { success: false, message: "La categoría ya no está disponible. Recarga el formulario.", errors: { category: "Selecciona una categoría vigente." } };
        let image = values.image;
        if (image?.startsWith(apiOrigin + "/media/products/")) image = image.slice(apiOrigin.length);
        const data = { code: values.code, name: values.name, description: values.description, categoryId: category.id,
            price: values.price, stock: values.stock, criticalStock: values.criticalStock, image,
            featured: expectedProduct?.featured ?? false,
            details: Object.fromEntries(detailKeys.filter(key => expectedProduct && Object.hasOwn(expectedProduct, key)).map(key => [key, expectedProduct[key]])),
            ...(id === undefined ? {} : { version: expectedProduct?.version }) };
        const product = await apiSession.authorized(id === undefined ? "/products" : `/products/${id}`, { method: id === undefined ? "POST" : "PUT", body: data });
        await remoteCatalog.reload();
        return { success: true, product };
    } catch (error) { return failure(error); }
}
export async function deleteRemoteProduct(id, expectedProduct) {
    if (!Number.isSafeInteger(id) || !Number.isSafeInteger(expectedProduct?.version)) return { success: false, message: "Recarga el producto antes de eliminarlo." };
    try {
        await apiSession.authorized(`/products/${id}?version=${expectedProduct.version}`, { method: "DELETE" });
        await remoteCatalog.reload();
        return { success: true };
    } catch (error) { return failure(error); }
}
