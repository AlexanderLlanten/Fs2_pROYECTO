/*
 * Servicio local de datos y operaciones.
 * Centraliza lectura y validación básica de usuarios, normalización de correo, generación de ids y
 * extracción de los campos de sesión.
 */

import { defaultUsers } from "../data/users.js";
import { AUTH_ROLES } from "../data/roles.js";

export const USERS_KEY = "kynex_users";
// Elimina espacios exteriores y convierte el correo a minúsculas si el valor es texto.
export const normalizeEmail = email => typeof email === "string" ? email.trim().toLowerCase() : "";

// Comprueba que la identidad sea un objeto con id seguro positivo, correo no vacío y rol admitido.
export function isValidIdentity(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        && Number.isSafeInteger(value.id) && value.id > 0
        && normalizeEmail(value.email) !== "" && AUTH_ROLES.includes(value.role);
}

// Amplía la comprobación de identidad con tipos y contenido básico de nombre, apellidos y contraseña.
function isValidUser(value) {
    return isValidIdentity(value) && typeof value.firstName === "string" && value.firstName.trim() !== ""
        && (value.lastName === undefined || typeof value.lastName === "string")
        && (value.password == null || typeof value.password === "string");
}

// Lee usuarios persistidos o prepara copias de cuentas iniciales si no existe almacenamiento.
// Identifica registros inválidos y datos corruptos.
export function readUsers() {
    // Las cuentas iniciales se usan si aún no existe la clave; una lectura dañada se informa para
    // evitar sobrescribirla silenciosamente.
    const stored = localStorage.getItem(USERS_KEY);
    if (stored === null) return { users: defaultUsers.map(user => ({ ...user })), needsInitialization: true };

    try {
        const parsed = JSON.parse(stored);
        // Se comprueba la estructura de cada usuario y que no haya ids repetidos. filter conserva
        // únicamente las entradas que sí son válidas.
        const valid = Array.isArray(parsed) && parsed.every(isValidUser)
            && new Set(parsed.map(user => user.id)).size === parsed.length;
        return { users: Array.isArray(parsed) ? parsed.filter(isValidUser) : [], isCorrupted: !valid, needsInitialization: false };
    } catch {
        return { users: [], needsInitialization: false, isCorrupted: true };
    }
}

// Extrae identidad, nombre, correo normalizado y rol. No incorpora la contraseña al objeto de sesión.
export function toSession(user) {
    return { id: user.id, firstName: user.firstName, lastName: user.lastName ?? "", email: normalizeEmail(user.email), role: user.role };
}

// Genera un identificador seguro y positivo que supera los ids existentes y considera la marca
// temporal actual.
export function nextUserId(users) {
    const id = Math.max(Date.now(), ...users.map(user => user.id + 1));
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("No se puede generar un identificador.");
    return id;
}
