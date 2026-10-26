import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addRoutineExercise, clearRoutine, readRoutine, refreshRoutine, removeRoutineExercise, ROUTINE_KEY, subscribeRoutine, updateRoutineExercise } from "./routineStore.js";

const saved = () => JSON.parse(localStorage.getItem(ROUTINE_KEY));

describe("Persistencia de rutina compatible con EP1", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());
    it("abre vacía sin escribir y devuelve una instantánea estable", () => {
        const write = vi.spyOn(Storage.prototype, "setItem");
        expect(readRoutine()).toEqual({ success: true, items: [] });
        expect(readRoutine()).toBe(readRoutine()); expect(write).not.toHaveBeenCalled();
    });
    it("conserva selecciones y ajustes heredados, usa sugerencias y omite ids ausentes sin escribir", () => {
        const raw = '[{"id":2,"sets":"5","reps":9},{"id":6},{"id":999,"sets":4,"reps":5}]';
        localStorage.setItem(ROUTINE_KEY, raw);
        expect(readRoutine().items).toEqual([{ id: 2, sets: 5, reps: 9 }, { id: 6, sets: 3, reps: 30 }]);
        expect(localStorage.getItem(ROUTINE_KEY)).toBe(raw);
    });
    it("agrega sugerencias, evita duplicados e ids desconocidos", () => {
        expect(addRoutineExercise(1).success).toBe(true);
        expect(saved()).toEqual([{ id: 1, sets: 4, reps: 10 }]);
        expect(addRoutineExercise(1).message).toMatch(/ya está agregado/);
        expect(addRoutineExercise(99).success).toBe(false);
        expect(saved()).toHaveLength(1);
    });
    it("edita solo el campo solicitado conservando el resto de la rutina", () => {
        addRoutineExercise(1); addRoutineExercise(2);
        expect(updateRoutineExercise(1, "sets", "6").success).toBe(true);
        expect(updateRoutineExercise(1, "reps", 15).success).toBe(true);
        expect(saved()).toEqual([{ id: 1, sets: 6, reps: 15 }, { id: 2, sets: 4, reps: 8 }]);
        const raw = localStorage.getItem(ROUTINE_KEY);
        expect(updateRoutineExercise(1, "sets", 0).success).toBe(false);
        expect(updateRoutineExercise(1, "reps", 101).success).toBe(false);
        expect(updateRoutineExercise(1, "id", 9).success).toBe(false);
        expect(updateRoutineExercise(99, "sets", 3).success).toBe(false);
        expect(localStorage.getItem(ROUTINE_KEY)).toBe(raw);
    });
    it("lee cambios recientes antes de editar, elimina una referencia y vacía quitando la clave", () => {
        addRoutineExercise(1);
        localStorage.setItem(ROUTINE_KEY, '[{"id":1,"sets":4,"reps":20},{"id":2,"sets":3,"reps":10}]');
        updateRoutineExercise(1, "sets", 5);
        expect(saved()[0]).toEqual({ id: 1, sets: 5, reps: 20 });
        expect(removeRoutineExercise(1).success).toBe(true); expect(saved()).toEqual([{ id: 2, sets: 3, reps: 10 }]);
        expect(clearRoutine().success).toBe(true); expect(localStorage.getItem(ROUTINE_KEY)).toBeNull();
        expect(readRoutine().items).toEqual([]);
    });
    it.each(["{", "null", "{}", "[null]", '[{"id":"1"}]', '[{"id":1},{"id":1}]'])("protege datos dañados: %s", raw => {
        localStorage.setItem(ROUTINE_KEY, raw);
        expect(readRoutine()).toMatchObject({ success: false, code: "CORRUPTED" });
        expect(addRoutineExercise(2).success).toBe(false);
        expect(updateRoutineExercise(1, "sets", 3).success).toBe(false);
        expect(removeRoutineExercise(1).success).toBe(false);
        expect(clearRoutine().success).toBe(false);
        expect(localStorage.getItem(ROUTINE_KEY)).toBe(raw);
    });
    it("informa fallos de lectura y permite volver a intentar", () => {
        const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("denied"); });
        expect(readRoutine()).toMatchObject({ success: false, code: "STORAGE" });
        read.mockRestore(); expect(readRoutine().success).toBe(true);
    });
    it("conserva los datos anteriores ante fallos de escritura o de vaciado", () => {
        addRoutineExercise(1); const raw = localStorage.getItem(ROUTINE_KEY);
        const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
        expect(addRoutineExercise(2).code).toBe("STORAGE");
        expect(updateRoutineExercise(1, "sets", 5).code).toBe("STORAGE");
        expect(removeRoutineExercise(1).code).toBe("STORAGE");
        expect(localStorage.getItem(ROUTINE_KEY)).toBe(raw); write.mockRestore();
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("denied"); });
        expect(clearRoutine().code).toBe("STORAGE"); expect(localStorage.getItem(ROUTINE_KEY)).toBe(raw);
    });
    it("notifica cambios locales, entre pestañas y de limpieza; retira la suscripción", () => {
        const listener = vi.fn(); const unsubscribe = subscribeRoutine(listener);
        addRoutineExercise(1);
        window.dispatchEvent(new StorageEvent("storage", { key: ROUTINE_KEY, storageArea: localStorage }));
        window.dispatchEvent(new StorageEvent("storage", { key: null }));
        expect(listener).toHaveBeenCalledTimes(3);
        window.dispatchEvent(new StorageEvent("storage", { key: "otra" }));
        window.dispatchEvent(new StorageEvent("storage", { key: ROUTINE_KEY, storageArea: sessionStorage }));
        expect(listener).toHaveBeenCalledTimes(3);
        unsubscribe(); refreshRoutine(); expect(listener).toHaveBeenCalledTimes(3);
    });
});
