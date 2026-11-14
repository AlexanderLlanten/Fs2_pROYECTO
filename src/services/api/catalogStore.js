/* Una petición compartida abastece a portada, catálogo, detalle y carrito sin duplicar la consulta. */
import { catalogApi } from "./catalog.js";

export function createRemoteCatalog(loadProducts = () => catalogApi.products()) {
    let snapshot = { success: false, loading: true, products: [] };
    let pending;
    let started = false;
    const listeners = new Set();
    const publish = value => { snapshot = value; listeners.forEach(listener => listener()); };
    async function reload() {
        if (pending) return pending;
        started = true;
        publish({ success: false, loading: true, products: [] });
        pending = Promise.resolve().then(loadProducts)
            .then(products => publish({ success: true, loading: false, products }))
            .catch(error => publish({ success: false, loading: false, products: [], message: error.message || "No fue posible cargar el catálogo." }))
            .finally(() => { pending = undefined; });
        return pending;
    }
    return {
        read: () => snapshot,
        subscribe(listener) {
            listeners.add(listener);
            if (!started) void reload();
            return () => listeners.delete(listener);
        },
        reload
    };
}

export const remoteCatalog = createRemoteCatalog();
