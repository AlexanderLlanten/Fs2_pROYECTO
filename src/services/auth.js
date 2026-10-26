import { defaultUsers } from "../data/users.js";
import { getRegistrationErrors, normalizeRegistration } from "../utils/registration.js";
import { cleanRun } from "../utils/validation.js";

export const USERS_KEY = "kynex_users";
export const SESSION_KEY = "kynex_session";
export const AUTH_ROLES = Object.freeze(["Cliente", "Vendedor", "Administrador"]);

const STORAGE_ERROR = "No fue posible acceder al almacenamiento de este navegador. Inténtalo nuevamente.";

function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidIdentity(value) {
    return value !== null
        && typeof value === "object"
        && !Array.isArray(value)
        && Number.isSafeInteger(value.id)
        && value.id > 0
        && normalizeEmail(value.email) !== ""
        && AUTH_ROLES.includes(value.role);
}

function isValidUser(value) {
    return isValidIdentity(value)
        && typeof value.firstName === "string"
        && value.firstName.trim() !== ""
        && (value.lastName === undefined || typeof value.lastName === "string")
        && (value.password == null || typeof value.password === "string");
}

function readUsers() {
    const stored = localStorage.getItem(USERS_KEY);

    if (stored === null) {
        return {
            users: defaultUsers.map(user => ({ ...user })),
            needsInitialization: true
        };
    }

    try {
        const parsed = JSON.parse(stored);
        return {
            users: Array.isArray(parsed) ? parsed.filter(isValidUser) : [],
            isCorrupted: !Array.isArray(parsed) || !parsed.every(isValidUser),
            needsInitialization: false
        };
    } catch {
        // No reemplazar registros dañados por las cuentas de demostración.
        return { users: [], needsInitialization: false, isCorrupted: true };
    }
}

function toSession(user) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName ?? "",
        email: normalizeEmail(user.email),
        role: user.role
    };
}

export function getSession() {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored === null) {
            return null;
        }

        const session = JSON.parse(stored);
        if (!isValidIdentity(session)) {
            return null;
        }

        const { users } = readUsers();
        const user = users.find(item =>
            item.id === session.id
            && normalizeEmail(item.email) === normalizeEmail(session.email)
        );

        // Los datos y el rol vigentes provienen del registro del usuario.
        return user ? toSession(user) : null;
    } catch {
        return null;
    }
}

export function loginUser(email, password) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== "string" || password === "") {
        return { success: false, message: "Ingresa tu correo y contraseña." };
    }

    try {
        const { users, needsInitialization } = readUsers();

        if (needsInitialization) {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        const user = users.find(item => normalizeEmail(item.email) === normalizedEmail);

        if (!user) {
            return { success: false, message: "No existe un usuario registrado con este correo." };
        }

        // Compatibilidad con las cuentas demostrativas de la EP1 sin contraseña.
        const storedPassword = user.password || "1234";

        if (storedPassword !== password) {
            return { success: false, message: "La contraseña ingresada no es correcta." };
        }

        const session = toSession(user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        return { success: true, session };
    } catch {
        return { success: false, message: STORAGE_ERROR };
    }
}

export function logoutUser() {
    try {
        localStorage.removeItem(SESSION_KEY);
        return { success: true };
    } catch {
        return { success: false, message: STORAGE_ERROR };
    }
}

export function registerUser(values) {
    const data = normalizeRegistration(values);
    const errors = getRegistrationErrors(data);
    if (Object.values(errors).some(Boolean)) {
        return { success: false, errors, message: "Revisa los campos marcados antes de continuar." };
    }

    try {
        const { users, isCorrupted } = readUsers();
        if (isCorrupted) {
            return { success: false, message: "Los usuarios guardados no se pueden leer correctamente. No se modificaron tus datos." };
        }
        if (users.some(user => cleanRun(user.run) === data.run)) {
            errors.run = "Ya existe un usuario registrado con este RUN.";
        }
        if (users.some(user => normalizeEmail(user.email) === data.email)) {
            errors.email = "Ya existe un usuario registrado con este correo.";
        }
        if (Object.values(errors).some(Boolean)) {
            return { success: false, errors, message: "Revisa los campos marcados antes de continuar." };
        }

        const id = Math.max(Date.now(), ...users.map(user => user.id + 1));
        if (!Number.isSafeInteger(id) || id <= 0) throw new Error("No se puede generar un identificador.");
        // La EP1 crea clientes con contraseña demostrativa 1234, sin abrir una sesión.
        const user = { ...data, id, password: "1234", role: "Cliente" };
        localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
        return { success: true, user: toSession(user) };
    } catch {
        return { success: false, message: STORAGE_ERROR };
    }
}
