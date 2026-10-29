/*
 * Organismo de interfaz.
 * Combina búsqueda, grupo muscular y dificultad. Presenta los ejercicios filtrados, identifica los ya
 * agregados y comunica la acción de agregar.
 */

import { useState } from "react";
import FormField from "../molecules/FormField.jsx";
import ExerciseCard from "../molecules/ExerciseCard.jsx";
import { filterExercises } from "../../utils/routine.js";

function ExerciseLibrary({ exercises, items, disabled, onAdd }) {
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [filters, setFilters] = useState({ search: "", muscle: "all", difficulty: "all" });
    const filtered = filterExercises(exercises, filters);
    // Actualiza solo el criterio de búsqueda o filtro indicado, conservando los demás filtros.
    function change(field, value) { setFilters(current => ({ ...current, [field]: value })); }
    return <section className="training-section" aria-labelledby="exercise-library-title"><div className="container">
        <p className="kynex-eyebrow">BIBLIOTECA</p><h2 id="exercise-library-title">Ejercicios disponibles</h2>
        <div className="training-toolbar">
            <FormField label="Buscar ejercicio" type="search" placeholder="Ej: sentadilla" value={filters.search} onChange={event => change("search", event.target.value)} />
            <FormField label="Grupo muscular" as="select" value={filters.muscle} onChange={event => change("muscle", event.target.value)}>
                <option value="all">Todos</option>{[...new Set(exercises.map(exercise => exercise.muscle))].map(muscle => <option key={muscle}>{muscle}</option>)}
            </FormField>
            <FormField label="Dificultad" as="select" value={filters.difficulty} onChange={event => change("difficulty", event.target.value)}>
                <option value="all">Todas</option>{["Principiante", "Intermedio", "Avanzado"].map(value => <option key={value}>{value}</option>)}
            </FormField>
        </div>
        <p className="training-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "ejercicio encontrado" : "ejercicios encontrados"}</p>
        {filtered.length ? <div className="training-grid">{filtered.map(exercise => <ExerciseCard key={exercise.id} exercise={exercise}
            added={items.some(item => item.id === exercise.id)} disabled={disabled} onAdd={onAdd} />)}</div>
            : <div className="training-empty"><i className="bi bi-search" aria-hidden="true" /><h3>No se encontraron ejercicios</h3><p>Prueba con otro término o modifica los filtros.</p></div>}
    </div></section>;
}

export default ExerciseLibrary;
