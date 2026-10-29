/*
 * Pruebas automatizadas.
 * Pruebas de LoginForm. Casos: «impide enviar campos vacíos, explica los errores y enfoca el
 * primero»; «valida al salir del campo y retira el error al corregirlo».
 */

import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import LoginForm from "./LoginForm.jsx";

function renderForm(onSubmit = vi.fn()) {
    render(<MemoryRouter><LoginForm onSubmit={onSubmit} /></MemoryRouter>);
    return onSubmit;
}

async function fillForm(user, { email = "camila@gmail.com", password = "1234" } = {}) {
    await user.type(screen.getByRole("textbox", { name: "Correo electrónico" }), email);
    await user.type(screen.getByLabelText(/^Contraseña/), password);
}

describe("LoginForm", () => {
    it("impide enviar campos vacíos, explica los errores y enfoca el primero", async () => {
        const user = userEvent.setup();
        const onSubmit = renderForm();

        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));

        const email = screen.getByRole("textbox", { name: "Correo electrónico" });
        expect(onSubmit).not.toHaveBeenCalled();
        expect(email).toHaveFocus();
        expect(email).toHaveAttribute("aria-invalid", "true");
        expect(email).toHaveAccessibleDescription(expect.stringContaining("El correo electrónico es obligatorio."));
        expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos marcados");
    });

    it("valida al salir del campo y retira el error al corregirlo", async () => {
        const user = userEvent.setup();
        renderForm();
        const email = screen.getByRole("textbox", { name: "Correo electrónico" });

        await user.type(email, "camila@outlook.com");
        await user.tab();
        expect(email).toHaveAttribute("aria-invalid", "true");

        await user.clear(email);
        await user.type(email, "camila@gmail.com");
        expect(email).not.toHaveAttribute("aria-invalid");

        const password = screen.getByLabelText(/^Contraseña/);
        await user.type(password, "123");
        await user.tab();
        expect(screen.getByText("La contraseña debe contener entre 4 y 10 caracteres.")).toBeInTheDocument();
        await user.type(password, "4");
        expect(password).not.toHaveAttribute("aria-invalid");
    });

    it("normaliza el correo y entrega las credenciales válidas una sola vez", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue({ success: true });
        renderForm(onSubmit);
        await fillForm(user, { email: "CAMILA@GMAIL.COM" });

        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));

        expect(onSubmit).toHaveBeenCalledExactlyOnceWith("camila@gmail.com", "1234");
    });

    it("muestra un rechazo del servicio y permite corregir las credenciales", async () => {
        const user = userEvent.setup();
        renderForm(vi.fn().mockResolvedValue({ success: false, message: "La contraseña ingresada no es correcta." }));
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));

        expect(screen.getByRole("alert")).toHaveTextContent("La contraseña ingresada no es correcta.");
        await user.clear(screen.getByLabelText(/^Contraseña/));
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("deshabilita el envío mientras se resuelve el acceso y evita solicitudes duplicadas", async () => {
        const user = userEvent.setup();
        let resolveLogin;
        const onSubmit = vi.fn(() => new Promise(resolve => { resolveLogin = resolve; }));
        renderForm(onSubmit);
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));

        const pendingButton = screen.getByRole("button", { name: "Ingresando…" });
        expect(pendingButton).toBeDisabled();
        expect(screen.getByRole("form")).toHaveAttribute("aria-busy", "true");
        await user.click(pendingButton);
        expect(onSubmit).toHaveBeenCalledTimes(1);

        await act(async () => resolveLogin({ success: false, message: "Inténtalo nuevamente." }));
        expect(screen.getByRole("button", { name: "Iniciar sesión", exact: true })).toBeEnabled();
        expect(screen.getByRole("alert")).toHaveTextContent("Inténtalo nuevamente.");
    });

    it("permite reintentar si el servicio produce un error inesperado", async () => {
        const user = userEvent.setup();
        renderForm(vi.fn().mockRejectedValue(new Error("Servicio no disponible")));
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));

        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible iniciar sesión. Inténtalo nuevamente.");
        expect(screen.getByRole("button", { name: "Iniciar sesión", exact: true })).toBeEnabled();
    });
});
