import { describe, it, expect, vi } from "vitest";
import { ApiError, createApiClient } from "./client.js";

describe("Cliente HTTP", () => {
    it("conserva autenticación y CSRF al utilizar una API del mismo sitio", async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });
        const request = createApiClient({ baseUrl: "/api/v1", fetcher });
        await request("/auth/refresh", { method: "POST", credentials: "include", headers: { "X-XSRF-TOKEN": "csrf-prueba" } });
        expect(fetcher).toHaveBeenCalledWith(new URL("/api/v1/auth/refresh", location.origin).href, expect.objectContaining({
            credentials: "include", headers: expect.objectContaining({ "X-XSRF-TOKEN": "csrf-prueba" })
        }));
    });
    it("envía JSON y un JWT solo cuando se proporciona", async () => {
        const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 1 }) });
        const request = createApiClient({ fetcher });
        await expect(request("/products", { method: "POST", token: "jwt-prueba", body: { name: "Creatina" } })).resolves.toEqual({ id: 1 });
        expect(fetcher).toHaveBeenCalledWith("http://localhost:8080/api/v1/products", expect.objectContaining({
            credentials: "omit", method: "POST", body: '{"name":"Creatina"}', headers: expect.objectContaining({ Authorization: "Bearer jwt-prueba" })
        }));
    });
    it("conserva estado y errores por campo del servidor", async () => {
        const request = createApiClient({ fetcher: async () => ({ ok: false, status: 400, json: async () => ({ detail: "Revisa los campos.", errors: { stock: "No puede ser negativo." } }) }) });
        await expect(request("/products")).rejects.toMatchObject({ status: 400, message: "Revisa los campos.", errors: { stock: "No puede ser negativo." } });
    });
    it("admite respuestas sin contenido", async () => {
        const request = createApiClient({ fetcher: async () => ({ ok: true, status: 204 }) });
        await expect(request("/products/1", { method: "DELETE" })).resolves.toBeNull();
    });
    it("comunica desconexión y JSON inválido", async () => {
        const offline = createApiClient({ fetcher: async () => { throw new TypeError("Failed to fetch"); } });
        await expect(offline("/products")).rejects.toBeInstanceOf(ApiError);
        const invalid = createApiClient({ fetcher: async () => ({ status: 502, json: async () => { throw new Error(); } }) });
        await expect(invalid("/products")).rejects.toMatchObject({ status: 502, message: "El servidor devolvió una respuesta no válida." });
    });
    it("cancela una solicitud que supera el tiempo límite", async () => {
        const request = createApiClient({ timeout: 5, fetcher: (_url, options) => new Promise((_resolve, reject) => {
            options.signal.addEventListener("abort", () => reject(new DOMException("Cancelled", "AbortError")));
        }) });
        await expect(request("/products")).rejects.toThrow(/tardó demasiado/);
    });
    it("rechaza direcciones y rutas ajenas al contrato", async () => {
        expect(() => createApiClient({ baseUrl: "https://user:pass@example.com" })).toThrow();
        const request = createApiClient();
        await expect(request("//untrusted.example.com")).rejects.toThrow(/ruta relativa/);
    });
});
