import { apiSession } from "./session.js";
import { CART_KEY } from "../../utils/cart.js";
import { apiBaseUrl } from "../../config/apiUrl.js";

const origin = apiBaseUrl.origin;
const MERGE_KEY = "kynex_guest_merge";
const empty = { version: 0, items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0, missingForFreeShipping: 0, canCheckout: false, warnings: [] };
const lock = work => globalThis.navigator?.locks?.request ? navigator.locks.request("kynex-guest-cart-merge", work) : work();
const picture = item => ({ ...item, image: item.image?.startsWith("/media/products/") ? origin + item.image : item.image });

/** Un almacén por cuenta evita conservar el carrito anterior al cambiar o cerrar sesión. */
export function createAccountCart({ ownerId, request = apiSession.authorized, storage = localStorage, notify = () => {} } = {}) {
    let state = { ...empty, loading: true, busy: false, error: "", loadError: false };
    let active = true;
    let pending;
    const checkSession = apiSession.guard();
    const listeners = new Set();
    const publish = next => { if (active) { state = next; listeners.forEach(listener => listener()); } };
    const accept = data => { if (data.version >= state.version) publish({ ...data, items: data.items.map(picture), loading: false, busy: false, error: "", loadError: false }); };
    async function reconcileGuest() {
        return lock(async () => {
            const raw = storage.getItem(CART_KEY);
            const saved = JSON.parse(storage.getItem(MERGE_KEY) || "null");
            if (saved && saved.ownerId !== ownerId) throw new Error("Se conservó un carrito visitante pendiente. No se agregó a esta cuenta.");
            // Una respuesta perdida se resuelve con su contenido original, aunque el visitante haya agregado más unidades.
            const source = saved?.raw ?? raw;
            const items = JSON.parse(source || "[]");
            if (!Array.isArray(items) || items.length > 100 || items.some(item => !Number.isSafeInteger(item?.id) || item.id <= 0 || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) {
                throw new Error("El carrito visitante no se pudo leer. Se conservaron sus datos.");
            }
            if (!items.length) return;
            const operation = saved || { ownerId, raw: source, requestId: crypto.randomUUID() };
            // Se guarda la clave antes del POST: un corte de red no puede duplicar la conciliación.
            storage.setItem(MERGE_KEY, JSON.stringify(operation));
            checkSession();
            const result = await request("/cart/merge", { method: "POST", body: { requestId: operation.requestId, items } });
            checkSession();
            const current = JSON.parse(storage.getItem(CART_KEY) || "[]");
            if (!Array.isArray(current)) throw new Error("El carrito visitante cambió y se conservaron sus datos.");
            const remaining = current.map(item => ({ ...item, quantity: item.quantity - (items.find(old => old.id === item.id)?.quantity || 0) })).filter(item => item.quantity > 0);
            storage.setItem(CART_KEY, JSON.stringify(remaining)); storage.removeItem(MERGE_KEY);
            notify();
            return result;
        });
    }
    async function reload({ merge = false } = {}) {
        if (pending) return pending;
        if (state.busy) return { success: false, message: "El carrito se está actualizando." };
        publish({ ...state, loading: true, error: "" });
        pending = (async () => {
            try {
                let warning = "";
                let merged;
                if (merge) try { merged = await reconcileGuest(); } catch (error) { warning = error.message; }
                checkSession();
                const data = await request("/cart");
                accept({ ...data, warnings: [...new Set([...(merged?.warnings || []), ...data.warnings])] });
                if (warning) publish({ ...state, error: warning });
                return { success: true };
            } catch (error) { publish({ ...empty, loading: false, busy: false, loadError: true, error: error.message }); return { success: false, message: error.message }; }
            finally { pending = undefined; }
        })();
        return pending;
    }
    async function change(id, quantity) {
        if (state.loading || state.busy || state.error) return { success: false, message: "Espera o recarga el carrito antes de modificarlo." };
        publish({ ...state, busy: true, error: "" });
        try {
            checkSession();
            const data = await request(id === null ? `/cart?version=${state.version}` : `/cart/items/${id}`, id === null
                ? { method: "DELETE" } : { method: "PUT", body: { quantity, version: state.version } });
            accept(data); notify(); return { success: true };
        } catch (error) {
            publish({ ...state, busy: false, error: error.message });
            if (error.status === 409) { const message = error.message; await reload(); publish({ ...state, error: message }); }
            return { success: false, message: error.message };
        }
    }
    return {
        read: () => state,
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        reload,
        add(product, quantity = 1) {
            if (!Number.isSafeInteger(quantity) || quantity <= 0) return Promise.resolve({ success: false, message: "La cantidad no es válida." });
            return change(product.id, (state.items.find(item => item.id === product.id)?.quantity || 0) + quantity);
        },
        increase: id => change(id, (state.items.find(item => item.id === id)?.quantity || 0) + 1),
        decrease: id => change(id, Math.max(0, (state.items.find(item => item.id === id)?.quantity || 0) - 1)),
        remove: id => change(id, 0), clear: () => change(null),
        dispose() { active = false; listeners.clear(); }
    };
}
