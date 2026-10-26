import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultUsers } from "../data/users.js";
import { registrationData } from "../test/registration.js";
import { CART_KEY } from "../utils/cart.js";
import { loginUser, registerUser, SESSION_KEY, USERS_KEY } from "./auth.js";

describe("Registro de clientes", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it("inicializa demos y guarda un cliente normalizado con contraseña EP1 sin iniciar sesión", () => {
        const result = registerUser({ ...registrationData, run: "9.876.543-3", email: " DANIELA@GMAIL.COM ", role: "Administrador", password: "otra" });
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        expect(result.success).toBe(true);
        expect(users.slice(0, 3)).toEqual(defaultUsers);
        expect(users[3]).toEqual({ ...registrationData, id: expect.any(Number), role: "Cliente", password: "1234" });
        expect(result.user).not.toHaveProperty("password");
        expect(result.user).not.toHaveProperty("run");
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(loginUser(registrationData.email, "1234").success).toBe(true);
    });

    it("respeta un registro vacío sin reponer demos y conserva carrito y sesión existentes", () => {
        localStorage.setItem(USERS_KEY, "[]");
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":3}]');
        localStorage.setItem(SESSION_KEY, "sesión previa");
        expect(registerUser(registrationData).success).toBe(true);
        expect(JSON.parse(localStorage.getItem(USERS_KEY))).toHaveLength(1);
        expect(localStorage.getItem(CART_KEY)).toBe('[{"id":2,"quantity":3}]');
        expect(localStorage.getItem(SESSION_KEY)).toBe("sesión previa");
    });

    it.each([
        [{ run: "12.345.678-5" }, "run"],
        [{ email: " CAMILA@GMAIL.COM " }, "email"]
    ])("rechaza duplicados contra cuentas existentes: %s", (change, field) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        const stored = localStorage.getItem(USERS_KEY);
        const result = registerUser({ ...registrationData, ...change });
        expect(result.success).toBe(false);
        expect(result.errors[field]).toContain("Ya existe");
        expect(localStorage.getItem(USERS_KEY)).toBe(stored);
    });

    it("vuelve a comprobar duplicados en cada envío y no guarda dos veces la cuenta", () => {
        expect(registerUser(registrationData).success).toBe(true);
        const stored = localStorage.getItem(USERS_KEY);
        expect(registerUser(registrationData).success).toBe(false);
        expect(localStorage.getItem(USERS_KEY)).toBe(stored);
    });

    it("rechaza datos inválidos antes de modificar el almacenamiento", () => {
        expect(registerUser({ ...registrationData, commune: "Otra comuna", email: "otro@outlook.com" })).toMatchObject({ success: false, errors: {
            commune: expect.any(String), email: expect.any(String)
        } });
        expect(localStorage.getItem(USERS_KEY)).toBeNull();
    });

    it.each(["JSON dañado", "{}", "null", "[null]", '[{"id":7}]'])("no sobrescribe usuarios dañados: %s", stored => {
        localStorage.setItem(USERS_KEY, stored);
        expect(registerUser(registrationData)).toMatchObject({ success: false, message: expect.stringContaining("No se modificaron") });
        expect(localStorage.getItem(USERS_KEY)).toBe(stored);
    });

    it("evita colisiones de identificadores con usuarios creados en el mismo instante", () => {
        vi.spyOn(Date, "now").mockReturnValue(12345);
        localStorage.setItem(USERS_KEY, JSON.stringify([{ ...defaultUsers[0], id: 12345 }]));
        expect(registerUser(registrationData).user.id).toBe(12346);
        expect(JSON.parse(localStorage.getItem(USERS_KEY)).map(user => user.id)).toEqual([12345, 12346]);
    });

    it.each(["getItem", "setItem"])("informa fallos de almacenamiento en %s sin anunciar éxito", method => {
        vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new DOMException("Bloqueado"); });
        expect(registerUser(registrationData)).toMatchObject({ success: false, message: expect.stringContaining("almacenamiento") });
    });
});
