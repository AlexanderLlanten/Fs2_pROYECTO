import { apiSession } from "./session.js";
import { remoteCatalog } from "./catalogStore.js";

/** Los avisos comunican un cambio público; no contienen credenciales ni datos privados. */
async function changed() {
    window.dispatchEvent(new Event("kynex-catalog-changed"));
    if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("kynex-catalog-events");
        channel.postMessage({ type: "catalog-changed" }); channel.close();
    }
    await remoteCatalog.reload();
}
async function write(path, options) {
    try {
        const category = await apiSession.authorized(path, options); await changed();
        return { success: true, category };
    } catch (error) { return { success: false, message: error.message, errors: error.errors, conflict: error.status === 409 }; }
}
export const categoryApi = {
    save: (name, category) => write(category ? `/categories/${category.id}` : "/categories", { method: category ? "PUT" : "POST",
        body: { name: name.trim(), ...(category ? { version: category.version } : {}) } }),
    deactivate: category => write(`/categories/${category.id}?version=${category.version}`, { method: "DELETE" })
};
