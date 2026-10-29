/*
 * Pruebas automatizadas.
 * Pruebas de DeleteUserDialog. Casos: «enfoca Cancelar y exige una decisión explícita antes de
 * eliminar»; «maneja Escape como cancelación y muestra errores sin perder la cuenta seleccionada».
 */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteUserDialog from "./DeleteUserDialog.jsx";

const account = { firstName: "Camila", lastName: "Soto", email: "camila@gmail.com" };

describe("DeleteUserDialog", () => {
    it("enfoca Cancelar y exige una decisión explícita antes de eliminar", async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        const onConfirm = vi.fn();
        render(<DeleteUserDialog user={account} onCancel={onCancel} onConfirm={onConfirm} />);
        expect(screen.getByRole("dialog", { name: "Eliminar usuario" })).toHaveAccessibleDescription(expect.stringContaining("Camila Soto"));
        expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
        expect(onConfirm).not.toHaveBeenCalled();
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(onCancel).toHaveBeenCalledOnce();
        await user.click(screen.getByRole("button", { name: "Eliminar usuario" }));
        expect(onConfirm).toHaveBeenCalledOnce();
    });

    it("maneja Escape como cancelación y muestra errores sin perder la cuenta seleccionada", () => {
        const onCancel = vi.fn();
        render(<DeleteUserDialog user={account} onCancel={onCancel} error="No se pudo guardar." />);
        const cancel = new Event("cancel", { cancelable: true });
        fireEvent(screen.getByRole("dialog"), cancel);
        expect(cancel.defaultPrevented).toBe(true);
        expect(onCancel).toHaveBeenCalledOnce();
        expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar.");
    });

    it("impide acciones duplicadas mientras se procesa la eliminación", async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        const onConfirm = vi.fn();
        render(<DeleteUserDialog user={account} busy onCancel={onCancel} onConfirm={onConfirm} />);
        expect(screen.getByRole("button", { name: "Eliminando…" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Eliminando…" }));
        fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
        expect(onCancel).not.toHaveBeenCalled();
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
