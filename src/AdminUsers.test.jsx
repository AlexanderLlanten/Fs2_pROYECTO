/*
 * Pruebas automatizadas.
 * Pruebas de integración. Gestión de usuarios, permisos, cuenta conectada, confirmaciones y
 * conflictos entre versiones.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { defaultUsers } from "./data/users.js";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { CART_KEY } from "./utils/cart.js";
import { fillRegistration, registrationData } from "./test/registration.js";

function openPage(path = "/admin/usuarios", email = "admin@profesor.duoc.cl") {
    if (email) loginUser(email, "1234");
    window.history.replaceState({}, "", path);
    return render(<App />);
}

describe("Gestión de usuarios integrada", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });

    it.each(["/admin/usuarios", "/admin/usuarios/nuevo", "/admin/usuarios/1/editar"])("reserva %s al Administrador", path => {
        openPage(path, "martin@duoc.cl");
        expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Usuarios" })).not.toBeInTheDocument();
    });

    it("retorna al formulario pedido después de autenticar al administrador", async () => {
        const user = userEvent.setup();
        openPage("/admin/usuarios/1/editar", null);
        await user.type(screen.getByRole("textbox", { name: "Correo electrónico" }), "admin@profesor.duoc.cl");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { level: 1, name: "Editar usuario" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/admin/usuarios/1/editar");
    });

    it("lista perfiles sin contraseñas y evita ofrecer la eliminación propia", () => {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(item => ({ ...item, password: item.id === 1 ? "secreto-de-prueba" : item.password }))));
        openPage();
        const table = screen.getByRole("table", { name: "Usuarios registrados en KYNEX" });
        expect(within(table).getAllByRole("row")).toHaveLength(4);
        const ownRow = within(table).getByRole("row", { name: /Administrador KYNEX/ });
        expect(ownRow).toHaveTextContent("Sesión actual");
        expect(within(ownRow).queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();
        expect(table).not.toHaveTextContent("secreto-de-prueba");
    });

    it("crea un usuario con el rol elegido y vuelve a la lista con confirmación", async () => {
        const user = userEvent.setup();
        openPage();
        await user.click(screen.getByRole("link", { name: "Nuevo usuario" }));
        await fillRegistration(user);
        await user.selectOptions(screen.getByRole("combobox", { name: "Tipo de usuario" }), "Vendedor");
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(await screen.findByRole("heading", { level: 1, name: "Usuarios" })).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Usuario creado correctamente");
        expect(screen.getByRole("row", { name: /Daniela Muñoz Soto/ })).toHaveTextContent("Vendedor");
        expect(JSON.parse(localStorage.getItem(USERS_KEY)).find(item => item.email === registrationData.email)).toMatchObject({ role: "Vendedor", password: "1234" });
    });

    it("edita un registro manteniendo su identidad y contraseña", async () => {
        const user = userEvent.setup();
        openPage();
        await user.click(screen.getByRole("link", { name: "Editar a Camila Soto Pérez" }));
        const name = screen.getByRole("textbox", { name: "Nombre", exact: true });
        await user.clear(name); await user.type(name, "Alicia");
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(await screen.findByRole("row", { name: /Alicia Soto Pérez/ })).toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Usuario actualizado correctamente");
        expect(JSON.parse(localStorage.getItem(USERS_KEY))[0]).toMatchObject({ id: 1, firstName: "Alicia", password: "1234" });
    });

    it("cancela o confirma la eliminación sin afectar sesión ni carrito", async () => {
        const user = userEvent.setup();
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":3}]');
        openPage();
        const session = localStorage.getItem(SESSION_KEY);
        await user.click(screen.getByRole("button", { name: "Eliminar a Camila Soto Pérez" }));
        expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(screen.getByRole("row", { name: /Camila Soto Pérez/ })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Eliminar a Camila Soto Pérez" }));
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar usuario" }));
        expect(screen.queryByRole("row", { name: /Camila Soto Pérez/ })).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Usuario eliminado correctamente");
        expect(localStorage.getItem(SESSION_KEY)).toBe(session);
        expect(localStorage.getItem(CART_KEY)).toBe('[{"id":2,"quantity":3}]');
    });

    it("mantiene el registro y muestra el error si no puede persistir una eliminación", async () => {
        const user = userEvent.setup();
        openPage();
        const setItem = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(key, value) {
            if (key === USERS_KEY) throw new DOMException("Sin espacio");
            return setItem.call(this, key, value);
        });
        await user.click(screen.getByRole("button", { name: "Eliminar a Camila Soto Pérez" }));
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar usuario" }));
        expect(screen.getByRole("alert")).toHaveTextContent("almacenamiento");
        expect(JSON.parse(localStorage.getItem(USERS_KEY))).toHaveLength(3);
    });

    it("actualiza el perfil conectado al modificar su correo", async () => {
        const user = userEvent.setup();
        openPage("/admin/usuarios/3/editar");
        const email = screen.getByRole("textbox", { name: "Correo electrónico" });
        await user.clear(email); await user.type(email, "admin.actualizado@duoc.cl");
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(await screen.findByRole("heading", { level: 1, name: "Usuarios" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(SESSION_KEY))).toMatchObject({ email: "admin.actualizado@duoc.cl", role: "Administrador" });
        expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    });

    it("retira el área administrativa si el usuario cambia su propio rol a Cliente", async () => {
        const user = userEvent.setup();
        openPage("/admin/usuarios/3/editar");
        await user.selectOptions(screen.getByRole("combobox", { name: "Tipo de usuario" }), "Cliente");
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(await screen.findByRole("heading", { name: "Suplementación para cada objetivo" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/productos");
        expect(JSON.parse(localStorage.getItem(SESSION_KEY)).role).toBe("Cliente");
    });

    it("no reemplaza el borrador con cambios de otra pestaña y exige recargar antes de guardar", async () => {
        const user = userEvent.setup();
        openPage("/admin/usuarios/1/editar");
        const name = screen.getByRole("textbox", { name: "Nombre", exact: true });
        await user.clear(name); await user.type(name, "Borrador local");
        act(() => {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(item => item.id === 1 ? { ...item, firstName: "Cambio externo" } : item)));
            window.dispatchEvent(new StorageEvent("storage", { key: USERS_KEY, storageArea: localStorage }));
        });
        expect(name).toHaveValue("Borrador local");
        expect(screen.getByRole("button", { name: "Guardar usuario" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Recargar datos" }));
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue("Cambio externo");
        expect(screen.getByRole("button", { name: "Guardar usuario" })).toBeEnabled();
    });

    it.each(["999", "invalido"])("muestra un error al editar un usuario inexistente: %s", id => {
        openPage(`/admin/usuarios/${id}/editar`);
        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible encontrar el usuario");
        expect(screen.queryByRole("form")).not.toBeInTheDocument();
    });

    it("sincroniza la lista cuando se crea un usuario desde otra pestaña", () => {
        openPage();
        act(() => {
            localStorage.setItem(USERS_KEY, JSON.stringify([...defaultUsers, { ...registrationData, id: 4, role: "Cliente", password: "1234" }]));
            window.dispatchEvent(new StorageEvent("storage", { key: USERS_KEY, storageArea: localStorage }));
        });
        expect(screen.getByRole("row", { name: /Daniela Muñoz Soto/ })).toBeInTheDocument();
    });
});
