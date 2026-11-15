import { api, ApiError } from "./client.js";
import { apiSession } from "./session.js";

// La recepción es pública y no transmite la sesión ni almacena el contenido en el navegador.
export const contactApi = {
    async linkAccount(message) {
        try { return { success: true, detail: await apiSession.authorized(`/admin/contact/${message.id}/account-link`, { method: "POST", body: { version: message.version } }) }; }
        catch (error) { return { success: false, message: error.message, conflict: error.status === 409 }; }
    },
    async submitOwned(values, submissionKey) {
        try {
            const receipt = await apiSession.authorized("/my/contact", { method: "POST", body: { submissionKey, comment: values.comment.trim() } });
            if (receipt?.reference !== submissionKey || !receipt.receivedAt) throw new ApiError("El servidor no confirmó la recepción. Reintenta el envío.");
            return { success: true, receipt };
        } catch (error) { return { success: false, message: error.message, errors: error.errors }; }
    },
    async claim(reference) {
        try { return { success: true, detail: await apiSession.authorized("/my/contact/claims", { method: "POST", body: { reference: reference.trim() } }) }; }
        catch (error) { return { success: false, message: error.status === 404 ? "No fue posible vincular la consulta. Comprueba la referencia y que el correo coincida con tu cuenta." : error.message }; }
    },
    async reply(message, text, replyKey) {
        try { return { success: true, detail: await apiSession.authorized(`/admin/contact/${message.id}/replies`, { method: "POST", body: { text: text.trim(), replyKey, version: message.version } }) }; }
        catch (error) { return { success: false, message: error.message, conflict: error.status === 409 }; }
    },
    async submit(values, submissionKey) {
        try {
            const receipt = await api("/contact", { method: "POST", body: { submissionKey,
                name: values.name.trim(), email: values.email.trim().toLowerCase(), comment: values.comment.trim() } });
            if (receipt?.reference !== submissionKey || !receipt.receivedAt) throw new ApiError("El servidor no confirmó la recepción. Reintenta el envío.");
            return { success: true, receipt };
        } catch (error) { return { success: false, message: error.message, errors: error.errors }; }
    },
    async attend(message, values) {
        try {
            const detail = await apiSession.authorized(`/admin/contact/${message.id}`, { method: "PUT",
                body: { status: values.status, note: values.note.trim(), version: message.version } });
            return { success: true, detail };
        } catch (error) { return { success: false, message: error.message, errors: error.errors, conflict: error.status === 409 }; }
    }
};
