import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegistrationForm from "./RegistrationForm.jsx";
import { fillRegistration, registrationData } from "../../test/registration.js";

function renderForm(onSubmit = vi.fn()) {
    render(<MemoryRouter><RegistrationForm onSubmit={onSubmit} /></MemoryRouter>);
    return onSubmit;
}

describe("RegistrationForm", () => {
    it("impide enviar datos vacíos, asocia errores y enfoca el RUN", async () => {
        const user = userEvent.setup();
        const submit = renderForm();
        await user.click(screen.getByRole("button", { name: "Crear cuenta", exact: true }));
        expect(submit).not.toHaveBeenCalled();
        expect(screen.getByRole("textbox", { name: "RUN" })).toHaveFocus();
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveAccessibleDescription("El nombre es obligatorio.");
        expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos");
        expect(screen.getByLabelText("Fecha de nacimiento")).not.toBeRequired();
    });

    it("valida el RUN al salir y retira el error al corregir el dígito verificador", async () => {
        const user = userEvent.setup();
        renderForm();
        const run = screen.getByRole("textbox", { name: "RUN" });
        await user.type(run, "98765432");
        await user.tab();
        expect(run).toHaveAttribute("aria-invalid", "true");
        await user.clear(run);
        await user.type(run, "9.876.543-3");
        expect(run).not.toHaveAttribute("aria-invalid");
    });

    it("habilita comunas de la región y reinicia la selección al cambiarla", async () => {
        const user = userEvent.setup();
        renderForm();
        const region = screen.getByRole("combobox", { name: "Región" });
        const commune = screen.getByRole("combobox", { name: "Comuna" });
        expect(commune).toBeDisabled();
        await user.selectOptions(region, registrationData.region);
        await user.selectOptions(commune, "Santiago");
        await user.selectOptions(region, "Región de Valparaíso");
        expect(commune).toHaveValue("");
        expect(screen.queryByRole("option", { name: "Santiago", exact: true })).not.toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Viña del Mar" })).toBeInTheDocument();
        await user.selectOptions(region, "");
        expect(commune).toBeDisabled();
    });

    it("envía datos normalizados, informa la contraseña inicial y reinicia el formulario", async () => {
        const user = userEvent.setup();
        const submit = renderForm(vi.fn().mockResolvedValue({ success: true }));
        await fillRegistration(user, { ...registrationData, run: "9.876.543-3", email: "DANIELA@GMAIL.COM" });
        await user.click(screen.getByRole("button", { name: "Crear cuenta", exact: true }));
        expect(submit).toHaveBeenCalledExactlyOnceWith(registrationData);
        expect(screen.getByRole("status")).toHaveTextContent("contraseña inicial es 1234");
        expect(screen.getByRole("link", { name: "Iniciar sesión con mi cuenta" })).toHaveAttribute("href", "/login");
        expect(screen.getByRole("textbox", { name: "RUN" })).toHaveValue("");
        expect(screen.getByRole("combobox", { name: "Comuna" })).toBeDisabled();
    });

    it("muestra duplicados del servicio, enfoca el campo y permite corregir los datos", async () => {
        const user = userEvent.setup();
        renderForm(vi.fn().mockResolvedValue({ success: false, errors: { email: "Ya existe un usuario registrado con este correo." }, message: "Revisa los campos." }));
        await fillRegistration(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta", exact: true }));
        const email = screen.getByRole("textbox", { name: "Correo electrónico" });
        expect(email).toHaveFocus();
        expect(email).toHaveAttribute("aria-invalid", "true");
        expect(email).toHaveValue(registrationData.email);
        await user.type(email, "a");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("evita envíos duplicados durante el registro y permite reintentar un fallo", async () => {
        const user = userEvent.setup();
        let resolveRegistration;
        const submit = renderForm(vi.fn(() => new Promise(resolve => { resolveRegistration = resolve; })));
        await fillRegistration(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta", exact: true }));
        expect(screen.getByRole("form")).toHaveAttribute("aria-busy", "true");
        const pending = screen.getByRole("button", { name: "Creando cuenta…" });
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(submit).toHaveBeenCalledTimes(1);
        await act(async () => resolveRegistration({ success: false, message: "No se pudo guardar." }));
        expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar.");
        expect(screen.getByRole("button", { name: "Crear cuenta", exact: true })).toBeEnabled();
    });

    it("conserva los valores si el servicio lanza un error inesperado", async () => {
        const user = userEvent.setup();
        renderForm(vi.fn().mockRejectedValue(new Error("Error inesperado")));
        await fillRegistration(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta", exact: true }));
        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible crear la cuenta.");
        expect(screen.getByRole("textbox", { name: "RUN" })).toHaveValue(registrationData.run);
    });
});
