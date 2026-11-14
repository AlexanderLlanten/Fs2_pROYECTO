import { describe, expect, it } from "vitest";
import { getApiPasswordError, getApiRegistrationErrors } from "./apiAccount.js";
import { registrationData } from "../test/registration.js";
describe("Validaciones de cuenta de servidor", () => {
    it("admite contraseñas largas y limita sus bytes UTF-8", () => {
        expect(getApiPasswordError("MiClaveSegura2026!", true)).toBe("");
        expect(getApiPasswordError("1234", true)).not.toBe("");
        expect(getApiPasswordError("á".repeat(37), true)).not.toBe("");
    });
    it("comprueba confirmación, correo general y fecha anterior a hoy", () => {
        const errors = getApiRegistrationErrors({ ...registrationData, email: "persona@example.com", password: "ClavePersonal2026!", passwordConfirmation: "otra", birthDate: "2999-01-01" });
        expect(errors.email).toBe(""); expect(errors.password).toBe("");
        expect(errors.passwordConfirmation).not.toBe(""); expect(errors.birthDate).not.toBe("");
    });
});
