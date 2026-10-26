import { getSession, SESSION_KEY } from "./auth.js";
import { nextUserId, normalizeEmail, readUsers, toSession, USERS_KEY } from "./userStore.js";
import { getManagedUserErrors, normalizeManagedUser } from "../utils/adminUsers.js";
import { cleanRun } from "../utils/validation.js";
import { hasPermission, PERMISSIONS } from "../utils/permissions.js";

const storageError = { success: false, code: "STORAGE", message: "No fue posible acceder al almacenamiento de este navegador. Inténtalo nuevamente." };
const forbidden = { success: false, code: "FORBIDDEN", message: "No tienes permiso para gestionar usuarios." };
const notFound = { success: false, code: "NOT_FOUND", message: "No fue posible encontrar el usuario solicitado." };
const validId = id => Number.isSafeInteger(id) && id > 0;
const toManagedUser = user => ({ id: user.id, ...normalizeManagedUser(user) });

function readAdminStore() {
    const store = readUsers();
    const session = getSession();
    const actor = store.users.find(user => user.id === session?.id && normalizeEmail(user.email) === session.email);
    if (!actor || !hasPermission(actor.role, PERMISSIONS.USERS_MANAGE)) return forbidden;
    if (store.isCorrupted) return { success: false, code: "CORRUPTED", message: "Los usuarios guardados no se pueden leer correctamente. No se modificaron tus datos." };
    return { success: true, users: store.users, actor };
}

function conflict(user, expectedUser) {
    return expectedUser && JSON.stringify(toManagedUser(user)) !== JSON.stringify(toManagedUser(expectedUser));
}

const changed = { success: false, code: "CONFLICT", message: "Este usuario cambió desde que lo abriste. Recarga sus datos antes de continuar." };

export function listManagedUsers() {
    try {
        const result = readAdminStore();
        return result.success ? { success: true, users: result.users.map(toManagedUser) } : result;
    } catch { return storageError; }
}

export function getManagedUser(id) {
    const result = listManagedUsers();
    if (!result.success) return result;
    const user = validId(id) && result.users.find(item => item.id === id);
    return user ? { success: true, user } : notFound;
}

export function saveManagedUser(values, { id, expectedUser } = {}) {
    try {
        const store = readAdminStore();
        if (!store.success) return store;
        const previous = id !== undefined ? store.users.find(user => validId(id) && user.id === id) : null;
        if (id !== undefined && !previous) return notFound;
        if (previous && conflict(previous, expectedUser)) return changed;
        const data = normalizeManagedUser(values);
        const errors = getManagedUserErrors(data);
        if (store.users.some(user => user.id !== id && cleanRun(user.run) === data.run)) errors.run = "Ya existe un usuario registrado con este RUN.";
        if (store.users.some(user => user.id !== id && normalizeEmail(user.email) === data.email)) errors.email = "Ya existe un usuario registrado con este correo.";
        if (Object.values(errors).some(Boolean)) return { success: false, errors, message: "Revisa los campos marcados antes de guardar el usuario." };

        const user = previous ? { ...previous, ...data } : { ...data, id: nextUserId(store.users), password: "1234" };
        const users = previous ? store.users.map(item => item.id === id ? user : item) : [...store.users, user];
        if (previous?.id === store.actor.id) {
            const oldSession = localStorage.getItem(SESSION_KEY);
            localStorage.setItem(SESSION_KEY, JSON.stringify(toSession(user)));
            try {
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            } catch (error) {
                // Cada setItem es atómico; restaurar la sesión si falla la escritura de usuarios.
                if (oldSession === null) localStorage.removeItem(SESSION_KEY);
                else localStorage.setItem(SESSION_KEY, oldSession);
                throw error;
            }
        } else localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return { success: true, user: toManagedUser(user) };
    } catch { return storageError; }
}

export function deleteManagedUser(id, expectedUser) {
    try {
        const store = readAdminStore();
        if (!store.success) return store;
        const user = validId(id) && store.users.find(item => item.id === id);
        if (!user) return notFound;
        if (user.id === store.actor.id) return { success: false, code: "SELF_DELETE", message: "No es posible eliminar el usuario que mantiene la sesión activa." };
        if (conflict(user, expectedUser)) return changed;
        localStorage.setItem(USERS_KEY, JSON.stringify(store.users.filter(item => item.id !== id)));
        return { success: true };
    } catch { return storageError; }
}
