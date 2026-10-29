/*
 * Reglas y funciones auxiliares.
 * Valida RUN con módulo 11, correo con formato y dominios permitidos y longitud de contraseña.
 * Devuelve texto de error o una cadena vacía cuando el dato es válido.
 */

const allowedEmailDomains = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

// Retira puntos y guion, recorta espacios exteriores y normaliza K a mayúscula.
export function cleanRun(run) {
    return typeof run === "string" ? run.replace(/[.-]/g, "").trim().toUpperCase() : "";
}

// Comprueba presencia, longitud, cuerpo numérico y dígito verificador por módulo 11; devuelve error o
// texto vacío.
export function getRunError(run) {
    const value = cleanRun(run);
    if (!value) return "El RUN es obligatorio.";
    if (value.length < 7 || value.length > 9) return "El RUN debe contener entre 7 y 9 caracteres.";

    const body = value.slice(0, -1);
    if (!/^\d+$/.test(body)) return "Ingresa un RUN válido, sin puntos ni guion.";

    let sum = 0;
    let multiplier = 2;
    // El módulo 11 recorre el cuerpo del RUN de derecha a izquierda y repite los multiplicadores del
    // 2 al 7.
    for (let index = body.length - 1; index >= 0; index--) {
        sum += Number(body[index]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    // El resto de la división permite obtener el dígito verificador; los resultados especiales se
    // representan como 0 y K.
    const result = 11 - (sum % 11);
    const verifier = result === 11 ? "0" : result === 10 ? "K" : String(result);
    return value.endsWith(verifier) ? "" : "Ingresa un RUN válido, sin puntos ni guion.";
}

// Comprueba presencia, longitud, estructura y pertenencia a los tres dominios autorizados.
export function getEmailError(email) {
    const value = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!value) {
        return "El correo electrónico es obligatorio.";
    }

    if (value.length > 100) {
        return "El correo no puede superar 100 caracteres.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        || !allowedEmailDomains.includes(value.split("@")[1])) {
        return "Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }

    return "";
}

// Comprueba contraseña no vacía y longitud de cuatro a diez caracteres.
export function getPasswordError(password) {
    if (typeof password !== "string" || password === "") {
        return "La contraseña es obligatoria.";
    }

    if (password.length < 4 || password.length > 10) {
        return "La contraseña debe contener entre 4 y 10 caracteres.";
    }

    return "";
}
