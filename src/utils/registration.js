/*
 * Reglas y funciones auxiliares.
 * Normaliza identidad y dirección y valida RUN, correo, longitudes, fecha y relación entre región y
 * comuna.
 */

import { regions } from "../data/regions.js";
import { cleanRun, getEmailError, getRunError } from "./validation.js";

// Recorta espacios exteriores de un texto y utiliza texto vacío cuando el valor no es una cadena.
const trim = value => typeof value === "string" ? value.trim() : "";

// Construye un objeto de registro normalizado; convierte fecha vacía a null y limpia campos
// textuales.
export function normalizeRegistration(values = {}) {
    // Si se recibió null o undefined se utiliza un objeto vacío. Se construye otro objeto para no
    // modificar los datos recibidos.
    values ??= {};
    return {
        run: cleanRun(values.run),
        firstName: trim(values.firstName),
        lastName: trim(values.lastName),
        email: trim(values.email).toLowerCase(),
        birthDate: trim(values.birthDate) || null,
        region: trim(values.region),
        commune: trim(values.commune),
        address: trim(values.address)
    };
}

// Devuelve mensajes por campo, incluidas fecha válida y relación región-comuna.
export function getRegistrationErrors(values = {}) {
    const data = normalizeRegistration(values);
    const region = regions.find(item => item.name === data.region);
    // Se contrasta la fecha escrita con la fecha interpretada: JavaScript puede ajustar días
    // inexistentes al mes siguiente.
    const date = data.birthDate ? new Date(`${data.birthDate}T00:00:00Z`) : null;
    const validDate = !data.birthDate || (/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)
        && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === data.birthDate);

    return {
        run: getRunError(data.run),
        firstName: !data.firstName ? "El nombre es obligatorio."
            : data.firstName.length > 50 ? "El nombre no puede superar 50 caracteres." : "",
        lastName: !data.lastName ? "Los apellidos son obligatorios."
            : data.lastName.length > 100 ? "Los apellidos no pueden superar 100 caracteres." : "",
        email: getEmailError(data.email),
        birthDate: validDate ? "" : "Ingresa una fecha de nacimiento válida.",
        region: region ? "" : "Selecciona una región.",
        commune: region?.communes.includes(data.commune) ? "" : "Selecciona una comuna de la región indicada.",
        address: !data.address ? "La dirección es obligatoria."
            : data.address.length > 300 ? "La dirección no puede superar 300 caracteres." : ""
    };
}
