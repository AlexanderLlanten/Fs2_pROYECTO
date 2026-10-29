/*
 * Molécula reutilizable.
 * Presenta un ejercicio guardado con sus series y repeticiones. Mantiene borradores de edición,
 * valida límites y comunica actualización o eliminación.
 */

import { useEffect, useId, useState } from "react";
import FormField from "./FormField.jsx";
import { getRoutineValueError, routineLimits } from "../../utils/routine.js";

function RoutineItem({ exercise, item, onUpdate, onRemove }) {
    const titleId = useId();
    // Los valores editables se mantienen como texto hasta validarlos y convertirlos en números en el
    // servicio.
    const [values, setValues] = useState({ sets: String(item.sets), reps: String(item.reps) });
    const [errors, setErrors] = useState({});
    // Si la rutina cambia fuera de este editor, los borradores se actualizan con las nuevas series y
    // repeticiones.
    useEffect(() => {
        setValues({ sets: String(item.sets), reps: String(item.reps) }); setErrors({});
    }, [item.sets, item.reps]);

    // El borrador permite escribir sin guardar cada tecla. Al perder foco se valida y solo se envía
    // un valor distinto del guardado.
    function commit(field) {
        const error = getRoutineValueError(field, values[field]);
        if (error) { setErrors(current => ({ ...current, [field]: error })); return; }
        if (Number(values[field]) === item[field]) return;
        const result = onUpdate(item.id, field, values[field]);
        setErrors(current => ({ ...current, [field]: result.success ? "" : result.message }));
    }

    return <article className="training-routine-item" aria-labelledby={titleId}>
        <div className="training-routine-name"><h3 id={titleId}>{exercise.name}</h3><p>{exercise.muscle} · {exercise.equipment}</p></div>
        {Object.entries({ sets: "Series", reps: "Repeticiones" }).map(([field, label]) => <FormField key={field}
            label={label} type="number" min="1" max={routineLimits[field]} step="1" value={values[field]}
            helpText={`De 1 a ${routineLimits[field]}`} error={errors[field]} fieldClassName="training-number"
            onChange={event => { setValues(current => ({ ...current, [field]: event.target.value })); setErrors(current => ({ ...current, [field]: "" })); }}
            onBlur={() => commit(field)} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} />)}
        <button className="training-remove" type="button" aria-label={`Eliminar ${exercise.name} de mi rutina`} onClick={() => onRemove(item.id)}>
            <i className="bi bi-trash" aria-hidden="true" /> Eliminar
        </button>
    </article>;
}

export default RoutineItem;
