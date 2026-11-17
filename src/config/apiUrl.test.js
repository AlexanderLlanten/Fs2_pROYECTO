import { describe, it, expect } from "vitest";
import { resolveApiUrl } from "./apiUrl.js";

describe("Dirección pública de la API", () => {
    it("usa el origen y puerto del navegador para el proxy de Docker", () => {
        expect(resolveApiUrl("/api/v1", "http://localhost:8081").href).toBe("http://localhost:8081/api/v1");
        expect(resolveApiUrl("/api/v1", "https://kynex.example").href).toBe("https://kynex.example/api/v1");
    });
    it("conserva la conexión directa del desarrollo local", () => {
        expect(resolveApiUrl("http://localhost:8080/api/v1", "http://localhost:5173").origin).toBe("http://localhost:8080");
    });
    it.each(["//otro.example/api/v1", "/\\otro.example/api/v1", "file:///api/v1", "https://user:secret@example.com/api", "https://example.com/api?token=x", "https://example.com/api#session"])("rechaza una configuración ambigua o con credenciales: %s", value => {
        expect(() => resolveApiUrl(value, "http://localhost:8081")).toThrow();
    });
});
