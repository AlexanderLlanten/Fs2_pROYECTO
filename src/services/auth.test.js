/*
 * Pruebas automatizadas.
 * Pruebas de auth. Casos: «inicia sin sesión y no escribe usuarios al consultar una visita anónima»;
 * «rechaza entradas incompletas o de tipos incorrectos sin lanzar errores».
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultUsers } from "../data/users.js";
import { CART_KEY } from "../utils/cart.js";
import { getSession, loginUser, logoutUser, SESSION_KEY, USERS_KEY } from "./auth.js";

describe("Servicio de autenticación demostrativa", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it("inicia sin sesión y no escribe usuarios al consultar una visita anónima", () => {
        expect(getSession()).toBeNull();
        expect(localStorage.getItem(USERS_KEY)).toBeNull();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it.each([
        ["camila@gmail.com", "Cliente"],
        ["martin@duoc.cl", "Vendedor"],
        ["admin@profesor.duoc.cl", "Administrador"]
    ])("autentica %s con su rol %s y guarda solamente los datos de sesión", (email, role) => {
        const result = loginUser(`  ${email.toUpperCase()}  `, "1234");

        expect(result.success).toBe(true);
        expect(result.session).toMatchObject({ email, role });
        expect(Object.keys(result.session).sort()).toEqual(["email", "firstName", "id", "lastName", "role"]);
        expect(JSON.parse(localStorage.getItem(SESSION_KEY))).toEqual(result.session);
        expect(JSON.parse(localStorage.getItem(USERS_KEY))).toEqual(defaultUsers);
        expect(getSession()).toEqual(result.session);
    });

    it.each([
        ["desconocido@gmail.com", "1234", "No existe un usuario registrado con este correo."],
        ["camila@gmail.com", "incorrecta", "La contraseña ingresada no es correcta."]
    ])("rechaza las credenciales inválidas de %s", (email, password, message) => {
        expect(loginUser(email, password)).toEqual({ success: false, message });
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it("rechaza entradas incompletas o de tipos incorrectos sin lanzar errores", () => {
        for (const [email, password] of [[undefined, undefined], [42, "1234"], ["camila@gmail.com", null], [" ", "1234"]]) {
            expect(loginUser(email, password)).toEqual({
                success: false,
                message: "Ingresa tu correo y contraseña."
            });
        }
        expect(localStorage.getItem(USERS_KEY)).toBeNull();
    });

    it("respeta los usuarios y contraseñas existentes sin reponer cuentas eliminadas", () => {
        const users = [{ ...defaultUsers[0], password: "otra-clave" }];
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        expect(loginUser("camila@gmail.com", "1234").success).toBe(false);
        expect(loginUser("camila@gmail.com", "otra-clave").success).toBe(true);
        expect(loginUser("admin@profesor.duoc.cl", "1234").success).toBe(false);
        expect(JSON.parse(localStorage.getItem(USERS_KEY))).toEqual(users);
    });

    it.each([undefined, null, ""])("conserva la contraseña demostrativa de cuentas antiguas sin contraseña (%s)", password => {
        localStorage.setItem(USERS_KEY, JSON.stringify([{ ...defaultUsers[0], password }]));

        expect(loginUser("camila@gmail.com", "1234").success).toBe(true);
    });

    it.each(["JSON inválido", "{}", "[]", "[null, 42, {}]"])(
        "tolera usuarios dañados o vacíos sin sobrescribirlos: %s",
        stored => {
            localStorage.setItem(USERS_KEY, stored);

            expect(loginUser("admin@profesor.duoc.cl", "1234").success).toBe(false);
            expect(localStorage.getItem(USERS_KEY)).toBe(stored);
            expect(getSession()).toBeNull();
        }
    );

    it.each(["JSON inválido", "null", "[]", "{}", '{"id":1,"email":"camila@gmail.com","role":"Desconocido"}'])(
        "ignora sesiones inválidas: %s",
        stored => {
            localStorage.setItem(SESSION_KEY, stored);
            expect(getSession()).toBeNull();
        }
    );

    it("recupera una sesión de la EP1 usando el perfil y rol vigentes del usuario", () => {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            id: 1,
            email: "CAMILA@GMAIL.COM",
            firstName: "Nombre antiguo",
            role: "Administrador",
            password: "no debe formar parte de la sesión"
        }));

        expect(getSession()).toEqual({
            id: 1,
            firstName: "Camila",
            lastName: "Soto Pérez",
            email: "camila@gmail.com",
            role: "Cliente"
        });
    });

    it("descarta sesiones de usuarios eliminados o con otra identidad", () => {
        const { session } = loginUser("camila@gmail.com", "1234");
        localStorage.setItem(USERS_KEY, "[]");
        expect(getSession()).toBeNull();

        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, email: "otra@gmail.com" }));
        expect(getSession()).toBeNull();
    });

    it("permite continuar como visitante si el almacenamiento no se puede leer", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new DOMException("Almacenamiento bloqueado", "SecurityError");
        });

        expect(getSession()).toBeNull();
        expect(loginUser("camila@gmail.com", "1234")).toMatchObject({
            success: false,
            message: expect.stringContaining("almacenamiento")
        });
    });

    it("no informa éxito cuando no se puede guardar la sesión", () => {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new DOMException("Sin espacio", "QuotaExceededError");
        });

        expect(loginUser("camila@gmail.com", "1234").success).toBe(false);
        expect(getSession()).toBeNull();
    });

    it("cierra únicamente la sesión, conservando los usuarios y el carrito", () => {
        loginUser("camila@gmail.com", "1234");
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 3 }]));

        expect(logoutUser()).toEqual({ success: true });
        expect(getSession()).toBeNull();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(JSON.parse(localStorage.getItem(USERS_KEY))).toEqual(defaultUsers);
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 3 }]);
    });

    it("informa si el navegador impide eliminar la sesión", () => {
        loginUser("camila@gmail.com", "1234");
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
            throw new DOMException("Almacenamiento bloqueado", "SecurityError");
        });

        expect(logoutUser().success).toBe(false);
        expect(getSession()?.email).toBe("camila@gmail.com");
    });
});
