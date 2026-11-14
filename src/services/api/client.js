/* Cliente HTTP común. Convierte respuestas fallidas en errores utilizables por los formularios. */
export class ApiError extends Error {
    constructor(message, status = 0, errors = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}

export function createApiClient({ baseUrl = "http://localhost:8080/api/v1", fetcher = (...args) => fetch(...args), timeout = 12000 } = {}) {
    const base = new URL(baseUrl);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
        throw new Error("La dirección de la API debe ser una URL http(s) sin credenciales ni parámetros.");
    }
    const root = base.href.replace(/\/$/, "");
    return async function request(path, { method = "GET", body, token, credentials = "omit", headers = {}, signal } = {}) {
        if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Usa una ruta relativa a la API.");
        const controller = new AbortController();
        const abort = () => controller.abort();
        if (signal?.aborted) controller.abort();
        signal?.addEventListener("abort", abort, { once: true });
        const timer = setTimeout(abort, timeout);
        try {
            const response = await fetcher(root + path, {
                method, credentials, signal: controller.signal,
                headers: { Accept: "application/json", ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
                ...(body !== undefined ? { body: JSON.stringify(body) } : {})
            });
            if (response.status === 204) return null;
            let data;
            try { data = await response.json(); }
            catch {
                throw new ApiError(response.status === 401 ? "Tu sesión o las credenciales no son válidas."
                    : response.status === 403 ? "No tienes permiso para realizar esta operación."
                    : "El servidor devolvió una respuesta no válida.", response.status);
            }
            if (!response.ok) throw new ApiError(data.detail || data.message || "No fue posible completar la solicitud.", response.status, data.errors || {});
            return data;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(error.name === "AbortError" ? "La solicitud se canceló o tardó demasiado. Inténtalo nuevamente."
                : "No fue posible conectar con el servidor. Comprueba la conexión e inténtalo nuevamente.");
        } finally {
            clearTimeout(timer);
            signal?.removeEventListener("abort", abort);
        }
    };
}

export const api = createApiClient({ baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1" });
