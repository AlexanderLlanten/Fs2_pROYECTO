/* Contrato de lectura del catálogo. En este modo no se consulta LocalStorage ni se usan datos de respaldo. */
import { api, ApiError } from "./client.js";

export function createCatalogApi(request = api, apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1") {
    const origin = new URL(apiUrl).origin;
    return {
        async products() {
            const data = await request("/products");
            const ids = new Set();
            if (!Array.isArray(data) || data.some(product => {
                if (!product || !Number.isSafeInteger(product.id) || product.id <= 0 || ids.has(product.id)
                    || !["name", "code", "category", "description"].every(key => typeof product[key] === "string")
                    || !Number.isFinite(product.price) || product.price < 0 || !Number.isSafeInteger(product.stock) || product.stock < 0) return true;
                ids.add(product.id);
                return false;
            })) throw new ApiError("El catálogo recibido no tiene un formato válido.");
            return data.map(product => ({ ...product,
                image: typeof product.image === "string" && product.image.startsWith("/media/products/") ? origin + product.image : product.image
            }));
        },
        categories: () => request("/categories")
    };
}

export const catalogApi = createCatalogApi();
