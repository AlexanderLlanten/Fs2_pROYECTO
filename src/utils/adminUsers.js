/*
 * Reglas y funciones auxiliares.
 * Normaliza datos de usuarios administrativos, combina validación de registro con roles permitidos y
 * valida identificadores de ruta.
 */

import { AUTH_ROLES } from "../data/roles.js";
import { getRegistrationErrors, normalizeRegistration } from "./registration.js";

// Normaliza los campos administrativos de usuario, incluido el perfil.
export function normalizeManagedUser(values) {
    // El spread copia los campos normalizados. role se agrega al final: si es texto se recorta con
    // trim; para otros tipos se usa texto vacío.
    return { ...normalizeRegistration(values), role: typeof values?.role === "string" ? values.role.trim() : "" };
}

// Combina los errores de registro con la comprobación de que el perfil esté en la lista de roles
// permitidos.
export function getManagedUserErrors(values) {
    // Los mensajes se agrupan por campo. includes acepta solo los perfiles permitidos; una cadena
    // vacía indica que role no tiene error.
    return { ...getRegistrationErrors(values), role: AUTH_ROLES.includes(values?.role) ? "" : "Selecciona un tipo de usuario válido." };
}

// Acepta un identificador formado por dígitos y devuelve su número entero seguro positivo; para un
// dato inválido devuelve null.
export function parseUserId(value) {
    // El patrón exige uno o más dígitos desde el inicio (^) hasta el final ($); rechaza espacios,
    // signos y texto adicional.
    if (!/^\d+$/.test(String(value))) return null;
    // Number convierte el texto de la ruta a número. isSafeInteger y el límite positivo descartan
    // identificadores inválidos.
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}
