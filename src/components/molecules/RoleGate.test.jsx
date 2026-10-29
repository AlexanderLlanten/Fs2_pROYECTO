/*
 * Pruebas automatizadas.
 * Pruebas de RoleGate. Casos: «muestra el fallback y responde a una pérdida de permisos».
 */

import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import AuthProvider from "../../context/AuthContext.jsx";
import { defaultUsers } from "../../data/users.js";
import { loginUser, USERS_KEY } from "../../services/auth.js";
import { PERMISSIONS } from "../../utils/permissions.js";
import RoleGate from "./RoleGate.jsx";

describe("RoleGate", () => {
    beforeEach(() => localStorage.clear());
    it.each([
        [null, false],
        ["camila@gmail.com", false],
        ["martin@duoc.cl", false],
        ["admin@profesor.duoc.cl", true]
    ])("muestra acciones de usuarios solo al perfil autorizado: %s", (email, allowed) => {
        if (email) loginUser(email, "1234");
        render(<AuthProvider><RoleGate permission={PERMISSIONS.USERS_MANAGE}><button>Gestionar usuarios</button></RoleGate></AuthProvider>);
        expect(Boolean(screen.queryByRole("button", { name: "Gestionar usuarios" }))).toBe(allowed);
    });

    it("muestra el fallback y responde a una pérdida de permisos", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        render(<AuthProvider><RoleGate permission={PERMISSIONS.USERS_MANAGE} fallback={<p>Sin permiso</p>}><button>Gestionar usuarios</button></RoleGate></AuthProvider>);
        act(() => {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 3 ? { ...user, role: "Vendedor" } : user)));
            window.dispatchEvent(new StorageEvent("storage", { key: USERS_KEY, storageArea: localStorage }));
        });
        expect(screen.getByText("Sin permiso")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Gestionar usuarios" })).not.toBeInTheDocument();
    });
});
