/*
 * Pruebas automatizadas.
 * Pruebas de RoutineItem. Casos: «guarda al salir del campo o pulsar Enter y permite quitar el
 * ejercicio»; «rechaza cantidades fuera de rango sin guardar y permite corregir».
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RoutineItem from "./RoutineItem.jsx";
import { exercises } from "../../data/exercises.js";

const item = { id: 1, sets: 4, reps: 10 };
describe("RoutineItem", () => {
    it("guarda al salir del campo o pulsar Enter y permite quitar el ejercicio", async () => {
        const user = userEvent.setup(); const onUpdate = vi.fn(() => ({ success: true })); const onRemove = vi.fn();
        render(<RoutineItem exercise={exercises[0]} item={item} onUpdate={onUpdate} onRemove={onRemove} />);
        const sets = screen.getByRole("spinbutton", { name: "Series" });
        await user.clear(sets); await user.type(sets, "6"); await user.tab();
        expect(onUpdate).toHaveBeenCalledWith(1, "sets", "6");
        const reps = screen.getByRole("spinbutton", { name: "Repeticiones" });
        await user.clear(reps); await user.type(reps, "15{Enter}");
        expect(onUpdate).toHaveBeenCalledWith(1, "reps", "15");
        await user.click(screen.getByRole("button", { name: "Eliminar Press de banca de mi rutina" }));
        expect(onRemove).toHaveBeenCalledExactlyOnceWith(1);
    });
    it("rechaza cantidades fuera de rango sin guardar y permite corregir", async () => {
        const user = userEvent.setup(); const onUpdate = vi.fn(() => ({ success: true }));
        render(<RoutineItem exercise={exercises[0]} item={item} onUpdate={onUpdate} />);
        const sets = screen.getByRole("spinbutton", { name: "Series" });
        for (const invalid of ["0", "21", "1.5", ""]) {
            await user.clear(sets); if (invalid) await user.type(sets, invalid); await user.tab();
            expect(sets).toHaveAttribute("aria-invalid", "true");
        }
        expect(onUpdate).not.toHaveBeenCalled();
        await user.type(sets, "5"); await user.tab();
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith(1, "sets", "5");
        expect(sets).not.toHaveAttribute("aria-invalid");
    });
    it("muestra errores de persistencia y sincroniza ajustes nuevos por props", async () => {
        const user = userEvent.setup(); const onUpdate = vi.fn(() => ({ success: false, message: "No se pudo guardar" }));
        const { rerender } = render(<RoutineItem exercise={exercises[0]} item={item} onUpdate={onUpdate} />);
        const reps = screen.getByRole("spinbutton", { name: "Repeticiones" });
        await user.clear(reps); await user.type(reps, "15"); await user.tab();
        expect(reps).toHaveAccessibleDescription(/No se pudo guardar/);
        rerender(<RoutineItem exercise={exercises[0]} item={{ ...item, reps: 20 }} onUpdate={onUpdate} />);
        expect(reps).toHaveValue(20); expect(reps).not.toHaveAttribute("aria-invalid");
    });
});
