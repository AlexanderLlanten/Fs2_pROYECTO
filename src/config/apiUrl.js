/** Acepta la API directa o una ruta del mismo origen servida por el proxy de Docker. */
export function resolveApiUrl(value, browserOrigin = globalThis.location?.origin) {
    if (typeof value !== "string" || value.startsWith("//") || value.includes("\\")) {
        throw new Error("La dirección de la API debe ser una URL http(s) o una ruta del mismo sitio.");
    }
    const base = value.startsWith("/") ? new URL(value, browserOrigin) : new URL(value);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
        throw new Error("La dirección de la API debe ser una URL http(s) sin credenciales ni parámetros.");
    }
    return base;
}

export const apiBaseUrl = resolveApiUrl(import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1");
