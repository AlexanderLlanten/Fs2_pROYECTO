import { describe, it, expect, vi } from "vitest";
import { ApiError } from "./client.js";
import { createApiSession } from "./session.js";

const user = { id: 21, firstName: "Camila", lastName: "Soto", email: "camila@example.com", role: "Cliente" };
const issued = (token = "access-test", identity = user) => ({ accessToken: token, expiresIn: 600, user: identity });
const setup = handlers => {
    const request = vi.fn(async (path, options) => {
        if (path === "/auth/csrf") return { token: "csrf-test" };
        if (handlers[path]) return handlers[path](options);
        throw new Error(`Ruta no prevista ${path}`);
    });
    return { request, session: createApiSession({ request, lock: work => work() }) };
};

describe("Sesión HTTP", () => {
    it("recupera la identidad desde la cookie sin leer una identidad local", async () => {
        localStorage.setItem("kynex_session", JSON.stringify({ id: 1, role: "Administrador" }));
        const { session, request } = setup({ "/auth/refresh": () => issued() });
        expect(session.read().loading).toBe(true);
        await session.initialize();
        expect(session.read()).toEqual({ user, loading: false, error: "" });
        expect(request).toHaveBeenCalledWith("/auth/refresh", expect.objectContaining({ credentials: "include", headers: { "X-XSRF-TOKEN": "csrf-test" } }));
        expect(localStorage.getItem("kynex_session")).not.toContain("access-test");
        localStorage.clear();
    });
    it("deduplica renovaciones concurrentes", async () => {
        const { session, request } = setup({ "/auth/refresh": () => issued() });
        await Promise.all([session.restore(), session.restore(), session.initialize()]);
        expect(request.mock.calls.filter(([path]) => path === "/auth/refresh")).toHaveLength(1);
    });
    it("trata la ausencia de cookie como visitante y diferencia una caída del servidor", async () => {
        const denied = setup({ "/auth/refresh": () => { throw new ApiError("Sin sesión", 401); } });
        await denied.session.initialize(); expect(denied.session.read()).toEqual({ user: null, loading: false, error: "" });
        const offline = setup({ "/auth/refresh": () => { throw new ApiError("Servidor desconectado"); } });
        await offline.session.initialize(); expect(offline.session.read().error).toBe("Servidor desconectado");
    });
    it("envía la contraseña elegida con CSRF y normaliza el correo", async () => {
        const { session, request } = setup({ "/auth/login": () => issued() });
        expect((await session.login(" Camila@Example.com ", "MiClaveSegura2026!")).success).toBe(true);
        expect(request).toHaveBeenCalledWith("/auth/login", expect.objectContaining({ body: { email: "camila@example.com", password: "MiClaveSegura2026!" } }));
    });
    it("registra un perfil sin abrir sesión", async () => {
        const { session } = setup({ "/auth/register": () => user });
        expect((await session.register({ email: user.email, password: "ClaveElegida2026!" })).success).toBe(true);
        expect(session.read().user).toBeNull();
    });
    it("retira una sesión inválida y rechaza roles desconocidos", async () => {
        const { session } = setup({ "/auth/login": () => issued("access", { ...user, role: "SuperAdmin" }) });
        expect((await session.login(user.email, "ClaveElegida2026!")).success).toBe(false);
        expect(session.read().user).toBeNull();
    });
    it("renueva una sola vez al recibir varios 401 y reintenta cada operación", async () => {
        let counter = 0;
        const { session, request } = setup({
            "/auth/login": () => issued("old"), "/auth/refresh": () => { counter++; return issued("new"); },
            "/private": options => { if (options.token === "old") throw new ApiError("Expirado", 401); return { saved: true }; }
        });
        await session.login(user.email, "ClaveSegura2026!");
        expect(await Promise.all([session.authorized("/private"), session.authorized("/private")])).toEqual([{ saved: true }, { saved: true }]);
        expect(counter).toBe(1);
        expect(request.mock.calls.filter(([path]) => path === "/private")).toHaveLength(4);
    });
    it("no repite una petición después de fallar la renovación", async () => {
        const { session, request } = setup({ "/auth/login": () => issued(), "/private": () => { throw new ApiError("Expirado", 401); }, "/auth/refresh": () => { throw new ApiError("Revocado", 401); } });
        await session.login(user.email, "ClaveSegura2026!");
        await expect(session.authorized("/private")).rejects.toMatchObject({ status: 401 });
        expect(session.read().user).toBeNull();
        expect(request.mock.calls.filter(([path]) => path === "/private")).toHaveLength(1);
    });
    it("actualiza permisos al recibir 403 sin repetir la modificación", async () => {
        const { session, request } = setup({ "/auth/login": () => issued("admin", { ...user, role: "Administrador" }), "/private": () => { throw new ApiError("No autorizado", 403); }, "/auth/me": () => user });
        await session.login(user.email, "ClaveSegura2026!");
        await expect(session.authorized("/private", { method: "DELETE" })).rejects.toMatchObject({ status: 403 });
        expect(session.read().user.role).toBe("Cliente");
        expect(request.mock.calls.filter(([path]) => path === "/private")).toHaveLength(1);
    });
    it("el cierre retira los datos privados aunque falle la conexión", async () => {
        const { session } = setup({ "/auth/login": () => issued(), "/auth/logout": () => { throw new ApiError("offline"); } });
        await session.login(user.email, "ClaveSegura2026!");
        const result = await session.logout();
        expect(result.success).toBe(false); expect(session.read().user).toBeNull(); expect(session.read().error).toContain("no se pudo confirmar");
    });
    it("una renovación pendiente no restaura una sesión después del cierre", async () => {
        let finish;
        const { session } = setup({ "/auth/refresh": () => new Promise(resolve => { finish = resolve; }), "/auth/logout": () => null });
        const pending = session.restore();
        await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
        await session.logout(); finish(issued()); await pending;
        expect(session.read().user).toBeNull();
    });
    it("utiliza el bloqueo compartido para mutaciones de sesión", async () => {
        const lock = vi.fn(work => work());
        const session = createApiSession({ lock, request: async path => path.endsWith("csrf") ? { token: "csrf" } : issued() });
        await session.login(user.email, "ClaveSegura2026!"); await session.restore(); await session.logout();
        expect(lock).toHaveBeenCalledTimes(3);
    });
    it("no reintenta una modificación de una cuenta con la sesión de otra", async () => {
        let rejectPrevious;
        const { session, request } = setup({ "/auth/login": () => issued(), "/private": () => new Promise((_resolve,reject) => { rejectPrevious = reject; }) });
        await session.login(user.email, "ClaveSegura2026!");
        const previous = session.authorized("/private", { method: "DELETE" });
        await vi.waitFor(() => expect(rejectPrevious).toBeTypeOf("function"));
        await session.login("otra@example.com", "OtraClaveSegura2026!");
        rejectPrevious(new ApiError("Expirado", 401));
        await expect(previous).rejects.toThrow("La cuenta cambió");
        expect(request.mock.calls.filter(([path]) => path === "/private")).toHaveLength(1);
    });
    it("recuerda un cierre fallido al recargar y reintenta revocarlo antes de recuperar identidad", async () => {
        let pending = true;
        const logoutIntent = { get: () => pending, set: () => { pending = true; }, clear: () => { pending = false; } };
        const request = vi.fn(async path => path === "/auth/csrf" ? { token: "csrf" } : null);
        const session = createApiSession({ request, logoutIntent, lock: work => work() });
        await session.initialize();
        expect(request.mock.calls.some(([path]) => path === "/auth/refresh")).toBe(false);
        expect(request.mock.calls.some(([path]) => path === "/auth/logout")).toBe(true);
        expect(session.read().user).toBeNull(); expect(pending).toBe(false);
    });
});
