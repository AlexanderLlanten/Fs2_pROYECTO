/*
 * Servicio local de datos y operaciones.
 * Obtiene una sesión vigente, inicia y cierra sesión y registra clientes. Los datos residen en el
 * navegador; las credenciales tienen alcance demostrativo.
 */

import { getRegistrationErrors, normalizeRegistration } from "../utils/registration.js";
import { cleanRun } from "../utils/validation.js";
import { isValidIdentity, nextUserId, normalizeEmail, readUsers, toSession, USERS_KEY } from "./userStore.js";

export { USERS_KEY } from "./userStore.js";
export { AUTH_ROLES } from "../data/roles.js";
export const SESSION_KEY = "kynex_session";

const STORAGE_ERROR = "No fue posible acceder al almacenamiento de este navegador. Inténtalo nuevamente.";

// Lee la identidad guardada y la contrasta con usuarios vigentes. Devuelve los datos de sesión
// actuales o null cuando no son válidos.
export function getSession() {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored === null) {
            return null;
        }

        // Una sesión guardada debe tener estructura válida y corresponder a una cuenta que todavía
        // exista.
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

// Normaliza el correo, busca una cuenta, comprueba contraseña demostrativa y guarda la sesión cuando
// corresponde.
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

// Retira únicamente la clave de sesión y comunica si la operación se realizó correctamente.
export function logoutUser() {
    try {
        localStorage.removeItem(SESSION_KEY);
        return { success: true };
    } catch {
        return { success: false, message: STORAGE_ERROR };
    }
}

// Normaliza y valida el registro, detecta RUN y correo repetidos y guarda un Cliente con contraseña
// demostrativa inicial sin abrir sesión.
export function registerUser(values) {
    // Primero se preparan los datos y se validan. Cada mensaje no vacío impide continuar con el
    // registro.
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
        // RUN y correo deben ser únicos; la comparación utiliza sus versiones normalizadas.
        if (users.some(user => cleanRun(user.run) === data.run)) {
            errors.run = "Ya existe un usuario registrado con este RUN.";
        }
        if (users.some(user => normalizeEmail(user.email) === data.email)) {
            errors.email = "Ya existe un usuario registrado con este correo.";
        }
        if (Object.values(errors).some(Boolean)) {
            return { success: false, errors, message: "Revisa los campos marcados antes de continuar." };
        }

        const id = nextUserId(users);
        // La EP1 crea clientes con contraseña demostrativa 1234, sin abrir una sesión.
        const user = { ...data, id, password: "1234", role: "Cliente" };
        localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
        return { success: true, user: toSession(user) };
    } catch {
        return { success: false, message: STORAGE_ERROR };
    }
}
