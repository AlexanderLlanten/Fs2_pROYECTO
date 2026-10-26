import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { defaultUsers } from "../../data/users.js";
import { fillRegistration, registrationData } from "../../test/registration.js";
import AdminUserForm from "./AdminUserForm.jsx";

function renderForm(props = {}) { render(<MemoryRouter><AdminUserForm onSubmit={vi.fn()} {...props} /></MemoryRouter>); }

describe("AdminUserForm", () => {
    it("valida los campos requeridos y enfoca el primero sin guardar", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        renderForm({ onSubmit });
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(screen.getByRole("textbox", { name: "RUN" })).toHaveFocus();
        expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos");
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("comparte validaciones del registro y permite seleccionar un rol al crear", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue({ success: true });
        renderForm({ onSubmit });
        await fillRegistration(user);
        await user.selectOptions(screen.getByRole("combobox", { name: "Tipo de usuario" }), "Administrador");
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...registrationData, role: "Administrador" });
        expect(screen.queryByLabelText(/^Contraseña/)).not.toBeInTheDocument();
    });

    it("precarga el perfil completo y reinicia comuna al cambiar región", async () => {
        const user = userEvent.setup();
        renderForm({ initialUser: defaultUsers[0] });
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue("Camila");
        expect(screen.getByLabelText("Fecha de nacimiento")).toHaveValue("1998-06-12");
        expect(screen.getByRole("combobox", { name: "Comuna" })).toHaveValue("Santiago");
        await user.selectOptions(screen.getByRole("combobox", { name: "Región" }), "Región de Valparaíso");
        expect(screen.getByRole("combobox", { name: "Comuna" })).toHaveValue("");
        expect(screen.getByText("La contraseña actual se conserva al guardar.")).toBeInTheDocument();
    });

    it("enfoca un duplicado informado por el servicio y conserva los valores para corregir", async () => {
        const user = userEvent.setup();
        renderForm({ initialUser: defaultUsers[0], onSubmit: vi.fn().mockResolvedValue({ success: false, errors: { email: "Ya existe un usuario registrado con este correo." }, message: "Revisa el correo." }) });
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(screen.getByRole("textbox", { name: "Correo electrónico" })).toHaveFocus();
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue("Camila");
        await user.type(screen.getByRole("textbox", { name: "Nombre", exact: true }), "a");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("avisa si el administrador reduce su propio rol", async () => {
        const user = userEvent.setup();
        renderForm({ initialUser: defaultUsers[2], currentUserId: 3 });
        await user.selectOptions(screen.getByRole("combobox", { name: "Tipo de usuario" }), "Cliente");
        expect(screen.getByRole("status")).toHaveTextContent("perderás el acceso");
    });

    it("bloquea el envío repetido y recupera el formulario después de un error", async () => {
        const user = userEvent.setup();
        let resolveSave;
        const onSubmit = vi.fn(() => new Promise(resolve => { resolveSave = resolve; }));
        renderForm({ initialUser: defaultUsers[0], onSubmit });
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        const pending = screen.getByRole("button", { name: "Guardando…" });
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(onSubmit).toHaveBeenCalledOnce();
        await act(async () => resolveSave({ success: false, message: "Inténtalo nuevamente." }));
        expect(screen.getByRole("alert")).toHaveTextContent("Inténtalo nuevamente.");
        expect(screen.getByRole("button", { name: "Guardar usuario" })).toBeEnabled();
    });

    it("permite reintentar si el consumidor lanza un error", async () => {
        const user = userEvent.setup();
        renderForm({ initialUser: defaultUsers[0], onSubmit: vi.fn().mockRejectedValue(new Error("Fallo")) });
        await user.click(screen.getByRole("button", { name: "Guardar usuario" }));
        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible guardar el usuario.");
    });
});
