import { describe, expect, it } from "vitest";

import { getEmailError, getPasswordError } from "./validation.js";

describe("Validaciones de acceso de la EP1", () => {
    it.each(["  CAMILA@GMAIL.COM  ", "martin@duoc.cl", "admin@profesor.duoc.cl"])(
        "acepta el dominio permitido de %s",
        email => expect(getEmailError(email)).toBe("")
    );

    it.each(["sin-correo", "persona@outlook.com", "persona@gmail.com.ejemplo", "persona@sub.gmail.com"])(
        "rechaza formatos o dominios no permitidos: %s",
        email => expect(getEmailError(email)).toContain("Utiliza un correo")
    );

    it("exige correo y admite hasta 100 caracteres después de quitar espacios exteriores", () => {
        const email = `${"a".repeat(100 - "@gmail.com".length)}@gmail.com`;
        expect(getEmailError(" ")).toBe("El correo electrónico es obligatorio.");
        expect(getEmailError(email)).toBe("");
        expect(getEmailError(`a${email}`)).toBe("El correo no puede superar 100 caracteres.");
    });

    it.each(["1234", "1234567890"])("acepta la longitud válida de contraseña: %s", password => {
        expect(getPasswordError(password)).toBe("");
    });

    it("exige contraseña y conserva los límites de 4 a 10 caracteres", () => {
        expect(getPasswordError("")).toBe("La contraseña es obligatoria.");
        expect(getPasswordError("123")).toContain("entre 4 y 10");
        expect(getPasswordError("12345678901")).toContain("entre 4 y 10");
    });
});
