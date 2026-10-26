import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultUsers } from "../data/users.js";
import { registrationData } from "../test/registration.js";
import { CART_KEY } from "../utils/cart.js";
import { parseUserId } from "../utils/adminUsers.js";
import { getSession, loginUser, SESSION_KEY, USERS_KEY } from "./auth.js";
import { deleteManagedUser, getManagedUser, listManagedUsers, saveManagedUser } from "./adminUsers.js";

const newUser = { ...registrationData, role: "Vendedor" };
const readSaved = () => JSON.parse(localStorage.getItem(USERS_KEY));

describe("Gestión administrativa de usuarios", () => {
    beforeEach(() => { localStorage.clear(); loginUser("admin@profesor.duoc.cl", "1234"); });
    afterEach(() => vi.restoreAllMocks());

    it.each([null, "camila@gmail.com", "martin@duoc.cl"])("rechaza lectura y mutaciones sin permiso: %s", email => {
        localStorage.removeItem(SESSION_KEY);
        if (email) loginUser(email, "1234");
        const stored = localStorage.getItem(USERS_KEY);
        for (const result of [listManagedUsers(), getManagedUser(1), saveManagedUser(newUser), deleteManagedUser(1)]) {
            expect(result).toMatchObject({ success: false, code: "FORBIDDEN" });
        }
        expect(localStorage.getItem(USERS_KEY)).toBe(stored);
    });

    it("entrega solo los datos administrables y nunca contraseñas", () => {
        expect(listManagedUsers().users).toHaveLength(3);
        expect(getManagedUser(1).user).toMatchObject({ run: "123456785", email: "camila@gmail.com", address: "Av. Principal 123" });
        for (const user of listManagedUsers().users) expect(user).not.toHaveProperty("password");
    });

    it("crea con rol elegido, id único y contraseña EP1, ignorando campos no editables", () => {
        vi.spyOn(Date, "now").mockReturnValue(3);
        const result = saveManagedUser({ ...newUser, id: 3, run: "9.876.543-3", email: " DANIELA@GMAIL.COM ", password: "inyectada" });
        expect(result).toMatchObject({ success: true, user: { ...newUser, id: 4 } });
        expect(result.user).not.toHaveProperty("password");
        expect(readSaved()[3]).toEqual({ ...newUser, id: 4, password: "1234" });
        expect(readSaved().slice(0, 3)).toEqual(defaultUsers);
    });

    it.each([[{ run: "123456785" }, "run"], [{ email: " CAMILA@GMAIL.COM " }, "email"]])("impide duplicados normalizados: %s", (change, field) => {
        expect(saveManagedUser({ ...newUser, ...change })).toMatchObject({ success: false, errors: { [field]: expect.stringContaining("Ya existe") } });
        expect(readSaved()).toEqual(defaultUsers);
    });

    it("valida todo el perfil y el rol antes de guardar", () => {
        const result = saveManagedUser({ role: "Superadmin" });
        for (const field of ["run", "firstName", "lastName", "email", "role", "region", "commune", "address"]) expect(result.errors[field]).not.toBe("");
        expect(readSaved()).toEqual(defaultUsers);
    });

    it("edita sin considerar duplicado al propio registro y conserva contraseña y datos adicionales", () => {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 1 ? { ...user, password: "otra", preference: "conservar" } : user)));
        const original = getManagedUser(1).user;
        const result = saveManagedUser({ ...original, firstName: "Camila actualizada", role: "Vendedor", password: "no permitido", id: 999 }, { id: 1, expectedUser: original });
        expect(result.success).toBe(true);
        expect(readSaved()[0]).toMatchObject({ id: 1, firstName: "Camila actualizada", role: "Vendedor", password: "otra", preference: "conservar" });
    });

    it("actualiza la sesión al editar el correo y nombre del administrador conectado", () => {
        const original = getManagedUser(3).user;
        expect(saveManagedUser({ ...original, email: "admin.nuevo@duoc.cl", firstName: "Gestor" }, { id: 3 }).success).toBe(true);
        expect(getSession()).toMatchObject({ id: 3, firstName: "Gestor", email: "admin.nuevo@duoc.cl", role: "Administrador" });
        expect(JSON.parse(localStorage.getItem(SESSION_KEY))).not.toHaveProperty("password");
    });

    it("aplica inmediatamente una reducción del propio rol", () => {
        const original = getManagedUser(3).user;
        expect(saveManagedUser({ ...original, role: "Cliente" }, { id: 3 }).success).toBe(true);
        expect(getSession().role).toBe("Cliente");
        expect(saveManagedUser(newUser).code).toBe("FORBIDDEN");
    });

    it("elimina otro usuario, conserva carrito y sesión y bloquea eliminarse a sí mismo", () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":3}]');
        const session = localStorage.getItem(SESSION_KEY);
        expect(deleteManagedUser(3).code).toBe("SELF_DELETE");
        expect(deleteManagedUser(1).success).toBe(true);
        expect(readSaved().map(user => user.id)).toEqual([2, 3]);
        expect(localStorage.getItem(SESSION_KEY)).toBe(session);
        expect(localStorage.getItem(CART_KEY)).toBe('[{"id":2,"quantity":3}]');
    });

    it("detecta ediciones y eliminaciones concurrentes sin sobrescribir el registro nuevo", () => {
        const initial = getManagedUser(1).user;
        saveManagedUser({ ...initial, firstName: "Modificado en otra pestaña" }, { id: 1 });
        const stored = localStorage.getItem(USERS_KEY);
        expect(saveManagedUser(initial, { id: 1, expectedUser: initial }).code).toBe("CONFLICT");
        expect(deleteManagedUser(1, initial).code).toBe("CONFLICT");
        expect(localStorage.getItem(USERS_KEY)).toBe(stored);
        deleteManagedUser(1);
        expect(saveManagedUser(initial, { id: 1 }).code).toBe("NOT_FOUND");
    });

    it.each([0, -1, 1.5, "1", NaN, 999])("rechaza identificadores inválidos o inexistentes: %s", id => {
        expect(getManagedUser(id).code).toBe("NOT_FOUND");
        expect(deleteManagedUser(id).code).toBe("NOT_FOUND");
        expect(saveManagedUser(newUser, { id }).code).toBe("NOT_FOUND");
    });

    it.each(["dañado", "{}", "[null]", JSON.stringify([...defaultUsers, defaultUsers[0]])])("no sobrescribe almacenamiento dañado: %s", stored => {
        localStorage.setItem(USERS_KEY, stored);
        expect(saveManagedUser(newUser).success).toBe(false);
        expect(deleteManagedUser(1).success).toBe(false);
        expect(localStorage.getItem(USERS_KEY)).toBe(stored);
    });

    it("devuelve un error de corrupción si sobreviven registros legibles y un admin válido", () => {
        localStorage.setItem(USERS_KEY, JSON.stringify([...defaultUsers, null]));
        expect(listManagedUsers().code).toBe("CORRUPTED");
    });

    it.each(["getItem", "setItem"])("informa fallos de %s sin anunciar éxito", method => {
        vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new DOMException("Bloqueado"); });
        expect(saveManagedUser(newUser).code).toBe("STORAGE");
        expect(deleteManagedUser(1).code).toBe("STORAGE");
    });

    it("revierte la sesión si falla guardar el perfil propio", () => {
        const original = getManagedUser(3).user;
        const previousSession = localStorage.getItem(SESSION_KEY);
        const setItem = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(key, value) {
            if (key === USERS_KEY) throw new DOMException("Sin espacio");
            return setItem.call(this, key, value);
        });
        expect(saveManagedUser({ ...original, email: "nuevo@duoc.cl" }, { id: 3 }).code).toBe("STORAGE");
        expect(readSaved()).toEqual(defaultUsers);
        expect(localStorage.getItem(SESSION_KEY)).toBe(previousSession);
        expect(getSession()).toMatchObject({ email: original.email });
    });

    it("solo interpreta ids enteros positivos en las URLs", () => {
        expect(parseUserId("42")).toBe(42);
        for (const value of [undefined, null, "abc", "1e3", "1.5", "-1", "0", "9007199254740992"]) expect(parseUserId(value)).toBeNull();
    });
});
