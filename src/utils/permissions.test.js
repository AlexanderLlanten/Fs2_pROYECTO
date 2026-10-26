import { describe, expect, it } from "vitest";
import { AUTH_ROLES } from "../services/auth.js";
import { getRoleHome, hasPermission, PERMISSIONS } from "./permissions.js";

describe("Permisos administrativos heredados de EP1", () => {
    it.each(AUTH_ROLES)("aplica toda la matriz del perfil %s", role => {
        const expected = {
            Cliente: [],
            Vendedor: [PERMISSIONS.ADMIN_ACCESS, PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW],
            Administrador: Object.values(PERMISSIONS)
        };
        for (const permission of Object.values(PERMISSIONS)) {
            expect(hasPermission(role, permission)).toBe(expected[role].includes(permission));
        }
        expect(getRoleHome(role)).toBe(role === "Cliente" ? "/productos" : "/admin");
    });

    it("deniega roles y permisos desconocidos", () => {
        for (const role of [undefined, null, "Otro", "administrador", "constructor", "toString"]) {
            expect(hasPermission(role, PERMISSIONS.ADMIN_ACCESS)).toBe(false);
            expect(getRoleHome(role)).toBe("/productos");
        }
        expect(hasPermission("Administrador", "permiso inexistente")).toBe(false);
        expect(hasPermission("Administrador", undefined)).toBe(false);
    });
});
