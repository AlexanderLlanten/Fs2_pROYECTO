import { getRegistrationErrors, normalizeRegistration } from "./registration.js";

export function getApiEmailError(value) {
    const email = typeof value === "string" ? value.trim() : "";
    if (!email) return "El correo electrónico es obligatorio.";
    if (email.length > 100) return "El correo no puede superar 100 caracteres.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Ingresa un correo electrónico válido.";
}
export function getApiPasswordError(value, registering = false) {
    if (typeof value !== "string" || !value) return "La contraseña es obligatoria.";
    if (registering && value.length < 10) return "La contraseña debe contener al menos 10 caracteres.";
    return new TextEncoder().encode(value).length > 72 ? "La contraseña no puede superar 72 bytes. Usa una contraseña más corta." : "";
}
export function getApiProfileErrors(values) {
    const errors = getRegistrationErrors(values, { emailValidator: getApiEmailError });
    const date = values.birthDate ? new Date(`${values.birthDate}T00:00:00`) : null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date && date >= today) errors.birthDate = "La fecha de nacimiento debe ser anterior a hoy.";
    return errors;
}
export function getApiRegistrationErrors(values) {
    return { ...getApiProfileErrors(values), password: getApiPasswordError(values.password, true),
        passwordConfirmation: values.passwordConfirmation === values.password ? "" : "Las contraseñas no coinciden." };
}
export const normalizeApiRegistration = values => ({ ...normalizeRegistration(values), password: values.password });
