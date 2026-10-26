import { defaultUsers } from "../data/users.js";
import { AUTH_ROLES } from "../data/roles.js";

export const USERS_KEY = "kynex_users";
export const normalizeEmail = email => typeof email === "string" ? email.trim().toLowerCase() : "";

export function isValidIdentity(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        && Number.isSafeInteger(value.id) && value.id > 0
        && normalizeEmail(value.email) !== "" && AUTH_ROLES.includes(value.role);
}

function isValidUser(value) {
    return isValidIdentity(value) && typeof value.firstName === "string" && value.firstName.trim() !== ""
        && (value.lastName === undefined || typeof value.lastName === "string")
        && (value.password == null || typeof value.password === "string");
}

export function readUsers() {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored === null) return { users: defaultUsers.map(user => ({ ...user })), needsInitialization: true };

    try {
        const parsed = JSON.parse(stored);
        const valid = Array.isArray(parsed) && parsed.every(isValidUser)
            && new Set(parsed.map(user => user.id)).size === parsed.length;
        return { users: Array.isArray(parsed) ? parsed.filter(isValidUser) : [], isCorrupted: !valid, needsInitialization: false };
    } catch {
        return { users: [], needsInitialization: false, isCorrupted: true };
    }
}

export function toSession(user) {
    return { id: user.id, firstName: user.firstName, lastName: user.lastName ?? "", email: normalizeEmail(user.email), role: user.role };
}

export function nextUserId(users) {
    const id = Math.max(Date.now(), ...users.map(user => user.id + 1));
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("No se puede generar un identificador.");
    return id;
}
