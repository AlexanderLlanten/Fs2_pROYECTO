import { AUTH_ROLES } from "../data/roles.js";
import { getRegistrationErrors, normalizeRegistration } from "./registration.js";

export function normalizeManagedUser(values) {
    return { ...normalizeRegistration(values), role: typeof values?.role === "string" ? values.role.trim() : "" };
}

export function getManagedUserErrors(values) {
    return { ...getRegistrationErrors(values), role: AUTH_ROLES.includes(values?.role) ? "" : "Selecciona un tipo de usuario válido." };
}

export function parseUserId(value) {
    if (!/^\d+$/.test(String(value))) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}
