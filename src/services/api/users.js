import { apiSession } from "./session.js";
import { normalizeRegistration } from "../../utils/registration.js";

const roles = { Administrador: "ADMINISTRADOR", Vendedor: "VENDEDOR", Cliente: "CLIENTE" };
function announce() {
    if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("kynex-session-events");
        channel.postMessage({ type: "account-updated" }); channel.close();
    }
}
async function write(path, options) {
    try {
        const user = await apiSession.authorized(path, options); announce();
        return { success: true, user };
    } catch (error) { return { success: false, message: error.message,
        errors: Object.fromEntries(Object.entries(error.errors || {}).map(([field,message]) => [field.replace(/^profile\./, ""),message])),
        code: error.status === 409 ? "CONFLICT" : "HTTP" }; }
}
export const accountApi = {
    create: values => write("/admin/users", { method: "POST", body: { role: roles[values.role], profile: { ...normalizeRegistration(values), password: values.password } } }),
    update: (id, version, values) => write(`/admin/users/${id}`, { method: "PUT", body: { version, role: roles[values.role], profile: normalizeRegistration(values) } }),
    deactivate: (id, version) => write(`/admin/users/${id}?version=${version}`, { method: "DELETE" }),
    activate: (id, version) => write(`/admin/users/${id}/activation`, { method: "PUT", body: { version } }),
    profile: (version, values) => write("/profile", { method: "PUT", body: { version, profile: normalizeRegistration(values) } })
};
