/*
 * Reglas y funciones auxiliares.
 * Devuelve errores de nombre, correo y comentario usando límites de longitud y dominios permitidos.
 * Una validación correcta no equivale al envío del mensaje.
 */

import { getEmailError } from "./validation.js";

// Conserva un texto sin espacios exteriores; devuelve texto vacío para otros tipos de dato.
const text = value => typeof value === "string" ? value.trim() : "";

// Valida nombre, correo y comentario para la confirmación local de contacto.
export function getContactErrors(values = {}) {
    const name = text(values.name);
    const comment = text(values.comment);
    return {
        name: !name ? "El nombre es obligatorio." : name.length > 100 ? "El nombre no puede superar 100 caracteres." : "",
        email: getEmailError(values.email),
        comment: !comment ? "El comentario es obligatorio." : comment.length > 500 ? "El comentario no puede superar 500 caracteres." : ""
    };
}
