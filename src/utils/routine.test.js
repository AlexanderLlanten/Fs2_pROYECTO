/*
 * Pruebas automatizadas.
 * Pruebas de routine. Casos: «recupera sugerencias para datos heredados vacíos y ajusta valores fuera
 * de rango»; «busca en nombre y descripción sin depender de mayúsculas o espacios externos».
 */

import { describe, expect, it } from "vitest";
import { exercises } from "../data/exercises.js";
import { filterExercises, getRoutineValueError, normalizeRoutineValue } from "./routine.js";

describe("Reglas de la rutina", () => {
    it.each(["sets", "reps"])("acepta enteros y límites para %s", field => {
        const max = field === "sets" ? 20 : 100;
        for (const value of [1, String(max), " 3 "]) expect(getRoutineValueError(field, value)).toBe("");
        for (const value of ["", " ", 0, -1, 1.5, "abc", Infinity, max + 1]) expect(getRoutineValueError(field, value)).not.toBe("");
    });
    it("recupera sugerencias para datos heredados vacíos y ajusta valores fuera de rango", () => {
        expect(normalizeRoutineValue("sets", undefined, 4)).toBe(4);
        expect(normalizeRoutineValue("reps", "", 12)).toBe(12);
        expect(normalizeRoutineValue("sets", -1, 4)).toBe(4);
        expect(normalizeRoutineValue("sets", "5", 4)).toBe(5);
        expect(normalizeRoutineValue("sets", 500, 4)).toBe(20);
        expect(normalizeRoutineValue("reps", 200, 12)).toBe(100);
        expect(normalizeRoutineValue("sets", 2.8, 4)).toBe(2);
    });
    it("busca en nombre y descripción sin depender de mayúsculas o espacios externos", () => {
        expect(filterExercises(exercises, { search: "  SENTADILLA  " }).map(item => item.id)).toEqual([2]);
        expect(filterExercises(exercises, { search: "unilateral" }).map(item => item.id)).toEqual([3]);
        expect(filterExercises(exercises, {})).toHaveLength(8);
    });
    it("combina los tres filtros y admite resultados vacíos", () => {
        expect(filterExercises(exercises, { search: "cadera", muscle: "Piernas", difficulty: "Avanzado" }).map(item => item.id)).toEqual([7]);
        expect(filterExercises(exercises, { muscle: "Piernas", difficulty: "Principiante" })).toEqual([]);
    });
});
