/*
 * Pruebas automatizadas.
 * Pruebas de FormField. Casos: «asocia ayuda y error a selectores y áreas de texto»; «asocia
 * etiquetas únicas a cada campo sin exigir ids manuales».
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import FormField from "./FormField.jsx";

describe("FormField", () => {
    it("asocia ayuda y error a selectores y áreas de texto", () => {
        render(<>
            <FormField label="Región" as="select" defaultValue="" error="Selecciona una región.">
                <option value="">Selecciona</option><option value="RM">Metropolitana</option>
            </FormField>
            <FormField label="Dirección" as="textarea" rows={3} helpText="Calle y número." />
        </>);
        expect(screen.getByRole("combobox", { name: "Región" })).toHaveAccessibleDescription("Selecciona una región.");
        expect(screen.getByRole("option", { name: "Metropolitana" })).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Dirección" })).toHaveAccessibleDescription("Calle y número.");
    });

    it("asocia etiquetas únicas a cada campo sin exigir ids manuales", () => {
        render(
            <>
                <FormField label="Correo personal" type="email" required />
                <FormField label="Correo de contacto" type="email" />
            </>
        );

        const personal = screen.getByRole("textbox", { name: "Correo personal" });
        const contact = screen.getByLabelText("Correo de contacto");
        expect(personal).toBeRequired();
        expect(personal.id).not.toBe(contact.id);
    });

    it("asocia ayuda y errores al campo y retira el estado inválido al corregirlo", () => {
        const { rerender } = render(
            <FormField label="Correo" helpText="Usa tu correo registrado." error="Revisa el dominio." />
        );
        const field = screen.getByLabelText("Correo");

        expect(field).toHaveAttribute("aria-invalid", "true");
        expect(field).toHaveAccessibleDescription("Usa tu correo registrado. Revisa el dominio.");

        rerender(<FormField label="Correo" helpText="Usa tu correo registrado." />);
        expect(field).not.toHaveAttribute("aria-invalid");
        expect(field).toHaveAccessibleDescription("Usa tu correo registrado.");
        expect(screen.queryByText("Revisa el dominio.")).not.toBeInTheDocument();
    });
});
