/* Sesión en memoria. La cookie de renovación la administra el navegador y no se expone a JavaScript. */
import { api, ApiError } from "./client.js";
import { AUTH_ROLES } from "../../data/roles.js";

const withBrowserLock = work => globalThis.navigator?.locks?.request
    ? navigator.locks.request("kynex-auth-session", work) : work();

export function createApiSession({ request = api, lock = withBrowserLock, now = Date.now, logoutIntent } = {}) {
    let state = { user: null, loading: true, error: "" };
    let accessToken = "";
    let expiresAt = 0;
    let generation = 0;
    let refreshing;
    let initialized = false;
    const listeners = new Set();
    const publish = next => { state = next; listeners.forEach(listener => listener()); };
    const clear = (error = "") => { accessToken = ""; expiresAt = 0; publish({ user: null, loading: false, error }); };

    async function authPost(path, body) {
        const csrf = await request("/auth/csrf", { credentials: "include" });
        if (typeof csrf?.token !== "string") throw new ApiError("No fue posible preparar la sesión. Inténtalo nuevamente.");
        return request(path, { method: "POST", credentials: "include", body, headers: { "X-XSRF-TOKEN": csrf.token } });
    }
    function accept(data) {
        if (typeof data?.accessToken !== "string" || !data.accessToken || !Number.isFinite(data.expiresIn) || data.expiresIn <= 0
            || !Number.isSafeInteger(data.user?.id) || data.user.id <= 0 || !AUTH_ROLES.includes(data.user.role)) {
            throw new ApiError("El servidor devolvió una sesión no válida.");
        }
        accessToken = data.accessToken;
        expiresAt = now() + data.expiresIn * 1000;
        publish({ user: data.user, loading: false, error: "" });
    }
    async function restore() {
        if (logoutIntent?.get()) { await logout(); return null; }
        if (refreshing) return refreshing;
        const expected = generation;
        initialized = true;
        if (!state.user) publish({ user: null, loading: true, error: "" });
        refreshing = lock(async () => {
            try {
                const data = await authPost("/auth/refresh");
                if (generation === expected) accept(data);
                return generation === expected ? state.user : null;
            } catch (error) {
                if (generation === expected) clear(error.status === 401 ? "" : error.message);
                return null;
            }
        }).finally(() => { refreshing = undefined; });
        return refreshing;
    }
    async function login(email, password) {
        const expected = ++generation;
        initialized = true;
        try {
            const data = await lock(() => authPost("/auth/login", { email: email.trim().toLowerCase(), password }));
            if (expected !== generation) return { success: false, message: "La sesión cambió. Inténtalo nuevamente." };
            accept(data);
            logoutIntent?.clear();
            return { success: true, session: state.user };
        } catch (error) {
            if (generation === expected) clear();
            return { success: false, message: error.message, errors: error.errors };
        }
    }
    async function register(values) {
        try {
            const user = await lock(() => authPost("/auth/register", values));
            return { success: true, user };
        } catch (error) { return { success: false, message: error.message, errors: error.errors }; }
    }
    async function logout() {
        logoutIntent?.set();
        ++generation;
        initialized = true;
        clear(); // Retira datos privados aunque la conexión se interrumpa.
        try {
            await lock(() => authPost("/auth/logout"));
            logoutIntent?.clear();
            return { success: true };
        } catch {
            const message = "Se retiró la sesión de esta página, pero no se pudo confirmar el cierre en el servidor. Reintenta cerrar la sesión.";
            accessToken = ""; expiresAt = 0;
            publish({ user: null, loading: false, error: message, logoutPending: true });
            return { success: false, message };
        }
    }
    async function authorized(path, options = {}) {
        const expected = generation;
        if (!accessToken || now() >= expiresAt - 30000) await restore();
        if (generation !== expected) throw new ApiError("La cuenta cambió durante la solicitud. Inténtalo nuevamente.", 401);
        if (!accessToken) throw new ApiError("Inicia sesión para continuar.", 401);
        const usedToken = accessToken;
        try {
            const result = await request(path, { ...options, token: usedToken });
            if (generation !== expected) throw new ApiError("La cuenta cambió durante la solicitud.", 401);
            return result;
        }
        catch (error) {
            if (generation !== expected) throw new ApiError("La cuenta cambió durante la solicitud. Inténtalo nuevamente.", 401);
            if (error.status !== 401) {
                if (error.status === 403 && path !== "/auth/me") await identity();
                throw error;
            }
            // Una respuesta de una petición antigua no debe renovar otra vez el token ya renovado.
            if (accessToken === usedToken) await restore();
            if (generation !== expected) throw new ApiError("La cuenta cambió durante la solicitud. Inténtalo nuevamente.", 401);
            if (!accessToken) throw new ApiError("Tu sesión venció. Vuelve a iniciar sesión.", 401);
            try { return await request(path, { ...options, token: accessToken }); }
            catch (retryError) { if (retryError.status === 401) { ++generation; clear(); } throw retryError; }
        }
    }
    async function identity() {
        try {
            const user = await authorized("/auth/me");
            if (state.user && user.id === state.user.id && AUTH_ROLES.includes(user.role)) publish({ ...state, user });
            else { ++generation; clear(); }
            return state.user;
        } catch { ++generation; clear(); return null; }
    }
    return {
        read: () => state,
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        initialize: () => initialized ? Promise.resolve(state.user) : restore(),
        restore, login, logout, register, authorized, identity,
        guard() {
            const expected = generation;
            return () => { if (generation !== expected) throw new ApiError("La cuenta cambió durante la operación. Inténtalo nuevamente.", 401); };
        },
        expiresIn: () => Math.max(0, expiresAt - now()),
        invalidate(loggedOut = false) { ++generation; if (loggedOut) logoutIntent?.set(); else logoutIntent?.clear(); clear(); }
    };
}

// Solo guarda la intención de salida, nunca identidad, contraseña o token.
const logoutIntent = {
    get() { try { return sessionStorage.getItem("kynex_logout_pending") === "1"; } catch { return false; } },
    set() { try { sessionStorage.setItem("kynex_logout_pending", "1"); } catch { /* La sesión igualmente se retira de memoria. */ } },
    clear() { try { sessionStorage.removeItem("kynex_logout_pending"); } catch { /* No otorga acceso ni altera permisos. */ } }
};
export const apiSession = createApiSession({ logoutIntent });
