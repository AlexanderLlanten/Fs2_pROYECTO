import { getEmailError } from "./validation.js";

const text = value => typeof value === "string" ? value.trim() : "";

export function getContactErrors(values = {}) {
    const name = text(values.name);
    const comment = text(values.comment);
    return {
        name: !name ? "El nombre es obligatorio." : name.length > 100 ? "El nombre no puede superar 100 caracteres." : "",
        email: getEmailError(values.email),
        comment: !comment ? "El comentario es obligatorio." : comment.length > 500 ? "El comentario no puede superar 500 caracteres." : ""
    };
}
