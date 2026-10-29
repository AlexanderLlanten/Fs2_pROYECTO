/*
 * Pruebas automatizadas.
 * Pruebas de ContactForm. Casos: «bloquea datos vacíos, anuncia errores y enfoca el primero»; «valida
 * al salir del correo, enfoca el error al enviar y permite corregirlo».
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { contactData, fillContact } from "../../test/contact.js";
import ContactForm from "./ContactForm.jsx";

describe("ContactForm", () => {
    it("bloquea datos vacíos, anuncia errores y enfoca el primero", async () => {
        const user = userEvent.setup(); render(<ContactForm />);
        await user.click(screen.getByRole("button", { name: "Validar mensaje" }));
        const name = screen.getByRole("textbox", { name: "Nombre" });
        expect(name).toHaveFocus(); expect(name).toHaveAttribute("aria-invalid", "true");
        expect(name).toHaveAccessibleDescription("El nombre es obligatorio.");
        expect(screen.getByRole("textbox", { name: "Comentario" })).toHaveAccessibleDescription(/El comentario es obligatorio/);
        expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos");
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    it("valida al salir del correo, enfoca el error al enviar y permite corregirlo", async () => {
        const user = userEvent.setup(); render(<ContactForm />);
        await fillContact(user, { ...contactData, email: "daniela@example.com" });
        const email = screen.getByRole("textbox", { name: "Correo electrónico" });
        expect(email).toHaveAttribute("aria-invalid", "true");
        await user.click(screen.getByRole("button", { name: "Validar mensaje" }));
        expect(email).toHaveFocus();
        await user.clear(email); await user.paste(contactData.email);
        expect(email).not.toHaveAttribute("aria-invalid");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    it("limita el comentario a 500 caracteres y actualiza el contador accesible", async () => {
        const user = userEvent.setup(); render(<ContactForm />);
        const comment = screen.getByRole("textbox", { name: "Comentario" });
        expect(comment).toHaveAccessibleDescription("0 / 500 caracteres");
        await user.click(comment); await user.paste("a".repeat(500)); await user.type(comment, "b");
        expect(comment).toHaveValue("a".repeat(500));
        expect(comment).toHaveAccessibleDescription("500 / 500 caracteres");
        expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveAttribute("maxlength", "100");
        expect(screen.getByRole("textbox", { name: "Correo electrónico" })).toHaveAttribute("maxlength", "100");
    });
    it("confirma datos válidos y conserva los valores del formulario", async () => {
        const user = userEvent.setup(); render(<ContactForm />);
        await fillContact(user);
        await user.click(screen.getByRole("button", { name: "Validar mensaje" }));
        expect(screen.getByRole("status")).toHaveTextContent("Mensaje validado correctamente.");
        expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue(contactData.name);
        expect(screen.getByRole("textbox", { name: "Correo electrónico" })).toHaveValue(contactData.email);
        expect(screen.getByRole("textbox", { name: "Comentario" })).toHaveValue(contactData.comment);
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    it("retira la confirmación al editar y vuelve a validar el comentario", async () => {
        const user = userEvent.setup(); render(<ContactForm />); await fillContact(user);
        await user.click(screen.getByRole("button", { name: "Validar mensaje" }));
        const comment = screen.getByRole("textbox", { name: "Comentario" });
        await user.clear(comment);
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(comment).toHaveAttribute("aria-invalid", "true");
        await user.type(comment, "Hola");
        expect(comment).not.toHaveAttribute("aria-invalid");
        expect(comment).toHaveAccessibleDescription("4 / 500 caracteres");
    });
});
