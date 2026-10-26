export const routineLimits = { sets: 20, reps: 100 };

export function getRoutineValueError(field, value) {
    const number = Number(value);
    const max = routineLimits[field];
    return max && String(value).trim() !== "" && Number.isInteger(number) && number >= 1 && number <= max
        ? "" : `Ingresa un número entero entre 1 y ${max}.`;
}

export function normalizeRoutineValue(field, value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0
        ? Math.min(routineLimits[field], Math.max(1, Math.trunc(number))) : fallback;
}

export function filterExercises(exercises, { search = "", muscle = "all", difficulty = "all" }) {
    const query = search.trim().toLocaleLowerCase("es");
    return exercises.filter(exercise =>
        (!query || `${exercise.name} ${exercise.description}`.toLocaleLowerCase("es").includes(query))
        && (muscle === "all" || exercise.muscle === muscle)
        && (difficulty === "all" || exercise.difficulty === difficulty));
}
