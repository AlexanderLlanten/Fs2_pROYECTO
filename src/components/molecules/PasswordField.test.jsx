import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PasswordField from "./PasswordField.jsx";

describe("PasswordField", () => {
    it("muestra y oculta la contraseña sin cambiarla ni enviar el formulario", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn(event => event.preventDefault());
        render(
            <form onSubmit={onSubmit}>
                <PasswordField label="Contraseña" defaultValue="1234" />
            </form>
        );
        const password = screen.getByLabelText("Contraseña", { exact: true });
        expect(password).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
        expect(password).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: "Ocultar contraseña" })).toHaveAttribute("aria-pressed", "true");

        await user.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
        expect(password).toHaveAttribute("type", "password");
        expect(password).toHaveValue("1234");
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
