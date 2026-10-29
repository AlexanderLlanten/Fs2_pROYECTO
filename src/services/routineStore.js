/*
 * Servicio local de datos y operaciones.
 * Lee, normaliza y modifica ejercicios de rutina. Protege datos dañados, controla duplicados y
 * límites y notifica a los suscriptores después de una escritura correcta.
 */

import { exercises } from "../data/exercises.js";
import { getRoutineValueError, normalizeRoutineValue, routineLimits } from "../utils/routine.js";

export const ROUTINE_KEY = "kynex_routine";
const ROUTINE_CHANGED = "kynex:routine-changed";
const corrupted = { success: false, items: [], code: "CORRUPTED", message: "La rutina guardada no se puede leer correctamente. No se modificaron tus datos." };
const storageError = { success: false, items: [], code: "STORAGE", message: "No fue posible leer la rutina del almacenamiento. Inténtalo nuevamente." };
let lastRaw;
let snapshot;

// Lee la rutina, valida su estructura y normaliza series y repeticiones para ejercicios existentes.
export function readRoutine() {
    let raw;
    try { raw = localStorage.getItem(ROUTINE_KEY); } catch { return storageError; }
    // La instantánea estable evita interpretar cada lectura como un cambio nuevo en React.
    if (snapshot && raw === lastRaw) return snapshot;
    try {
        const parsed = raw === null ? [] : JSON.parse(raw);
        const ids = new Set();
        if (!Array.isArray(parsed) || parsed.some(item => {
            if (!item || !Number.isInteger(item.id) || ids.has(item.id)) return true;
            ids.add(item.id); return false;
        })) snapshot = corrupted;
        else snapshot = { success: true, items: parsed.flatMap(item => {
            const exercise = exercises.find(exercise => exercise.id === item.id);
            // Las referencias que ya no existen se omiten, como en la EP1.
            return exercise ? [{ id: item.id,
                sets: normalizeRoutineValue("sets", item.sets, exercise.defaultSets),
                reps: normalizeRoutineValue("reps", item.reps, exercise.defaultReps) }] : [];
        }) };
    } catch { snapshot = corrupted; }
    lastRaw = raw;
    return snapshot;
}

// Emite un evento local de cambio de rutina.
export function refreshRoutine() { window.dispatchEvent(new Event(ROUTINE_CHANGED)); }

// Escucha cambios locales y entre pestañas y devuelve su función de cancelación.
export function subscribeRoutine(listener) {
    // Manejador de cambios entre documentos del almacenamiento de rutina.
    function onStorage(event) {
        if ((!event.storageArea || event.storageArea === localStorage) && [ROUTINE_KEY, null].includes(event.key)) listener();
    }
    // Se escuchan tanto cambios entre pestañas como escrituras realizadas por esta misma ventana; la
    // función devuelta cancela ambas suscripciones.
    window.addEventListener("storage", onStorage);
    window.addEventListener(ROUTINE_CHANGED, listener);
    return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(ROUTINE_CHANGED, listener);
    };
}

// Guarda o retira únicamente la clave de rutina. Notifica el cambio después de una escritura exitosa.
function persist(items, clear = false) {
    try {
        // Vaciar retira únicamente la clave de rutina. Guardar convierte sus elementos en una cadena
        // JSON.
        if (clear) localStorage.removeItem(ROUTINE_KEY);
        else localStorage.setItem(ROUTINE_KEY, JSON.stringify(items));
    } catch { return { success: false, code: "STORAGE", message: "No fue posible guardar la rutina. Tus cambios anteriores se conservaron. Inténtalo nuevamente." }; }
    refreshRoutine();
    return { success: true };
}

// Agrega un ejercicio existente con sus valores sugeridos y rechaza duplicados o un almacén inválido.
export function addRoutineExercise(id) {
    const current = readRoutine();
    if (!current.success) return current;
    const exercise = exercises.find(exercise => exercise.id === id);
    if (!exercise) return { success: false, message: "El ejercicio no existe." };
    if (current.items.some(item => item.id === id)) return { success: false, message: "Este ejercicio ya está agregado a tu rutina." };
    return persist([...current.items, { id, sets: exercise.defaultSets, reps: exercise.defaultReps }]);
}

// Valida el campo, la cantidad y la existencia del ejercicio y persiste la actualización.
export function updateRoutineExercise(id, field, value) {
    const current = readRoutine();
    if (!current.success) return current;
    if (!Object.hasOwn(routineLimits, field)) return { success: false, message: "El campo de la rutina no es válido." };
    const error = getRoutineValueError(field, value);
    if (error) return { success: false, message: error };
    if (!current.items.some(item => item.id === id)) return { success: false, message: "El ejercicio ya no está en tu rutina." };
    return persist(current.items.map(item => item.id === id ? { ...item, [field]: Number(value) } : item));
}

// Guarda la rutina sin el identificador indicado cuando la lectura es válida.
export function removeRoutineExercise(id) {
    const current = readRoutine();
    if (!current.success) return current;
    return persist(current.items.filter(item => item.id !== id));
}

// Retira la rutina guardada si el almacén actual puede leerse correctamente.
export function clearRoutine() {
    const current = readRoutine();
    return current.success ? persist([], true) : current;
}
