/*
 * Pruebas automatizadas.
 * Pruebas de ExerciseLibrary. Casos: «muestra ocho ejercicios y marca los seleccionados»; «combina
 * búsqueda, músculo y dificultad y muestra un estado vacío recuperable».
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExerciseLibrary from "./ExerciseLibrary.jsx";
import { exercises } from "../../data/exercises.js";

describe("ExerciseLibrary", () => {
    it("muestra ocho ejercicios y marca los seleccionados", () => {
        render(<ExerciseLibrary exercises={exercises} items={[{ id: 2 }]} onAdd={vi.fn()} />);
        expect(screen.getAllByRole("article")).toHaveLength(8);
        expect(screen.getByText("8 ejercicios encontrados")).toBeInTheDocument();
        expect(within(screen.getByRole("article", { name: "Sentadilla" })).getByRole("button")).toBeDisabled();
    });
    it("combina búsqueda, músculo y dificultad y muestra un estado vacío recuperable", async () => {
        const user = userEvent.setup(); render(<ExerciseLibrary exercises={exercises} items={[]} onAdd={vi.fn()} />);
        await user.selectOptions(screen.getByLabelText("Grupo muscular"), "Piernas");
        expect(screen.getAllByRole("article")).toHaveLength(2);
        await user.selectOptions(screen.getByLabelText("Dificultad"), "Avanzado");
        expect(screen.getByText("1 ejercicio encontrado")).toBeInTheDocument();
        expect(screen.getByRole("article", { name: "Peso muerto rumano" })).toBeInTheDocument();
        await user.type(screen.getByRole("searchbox"), "sentadilla");
        expect(screen.getByRole("heading", { name: "No se encontraron ejercicios" })).toBeInTheDocument();
        expect(screen.queryByRole("article")).not.toBeInTheDocument();
        await user.clear(screen.getByRole("searchbox"));
        expect(screen.getByRole("article", { name: "Peso muerto rumano" })).toBeInTheDocument();
    });
});
