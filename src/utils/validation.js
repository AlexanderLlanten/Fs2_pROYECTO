const allowedEmailDomains = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

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

export function getPasswordError(password) {
    if (typeof password !== "string" || password === "") {
        return "La contraseña es obligatoria.";
    }

    if (password.length < 4 || password.length > 10) {
        return "La contraseña debe contener entre 4 y 10 caracteres.";
    }

    return "";
}
