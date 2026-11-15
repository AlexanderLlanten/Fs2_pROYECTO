import { api, ApiError } from "./client.js";
import { apiSession } from "./session.js";

// La recepción es pública y no transmite la sesión ni almacena el contenido en el navegador.
export const contactApi = {
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
