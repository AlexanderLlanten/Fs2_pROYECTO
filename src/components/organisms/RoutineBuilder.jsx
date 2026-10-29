/*
 * Organismo de interfaz.
 * Presenta el resumen y los ejercicios guardados. Coordina edición, eliminación y vaciado con
 * confirmación, mostrando los resultados de los servicios.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { exercises } from "../../data/exercises.js";
import useRoutine from "../../hooks/useRoutine.js";
import { clearRoutine, removeRoutineExercise, updateRoutineExercise } from "../../services/routineStore.js";
import RoutineItem from "../molecules/RoutineItem.jsx";
import RoutineError from "../molecules/RoutineError.jsx";
import ConfirmDeleteDialog from "../molecules/ConfirmDeleteDialog.jsx";
import Button from "../atoms/Button.jsx";

function RoutineBuilder() {
    const routine = useRoutine();
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [confirmClear, setConfirmClear] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    if (!routine.success) return <RoutineError resource={routine} />;

    // Solicita retirar el ejercicio seleccionado y convierte el resultado del servicio en un mensaje
    // visible.
    function remove(id) {
        const result = removeRoutineExercise(id);
        setError(result.success ? "" : result.message);
        setMessage(result.success ? "Ejercicio eliminado de tu rutina." : "");
    }
    // Solicita vaciar la rutina. Cierra la confirmación solo después de un resultado exitoso.
    function clear() {
        const result = clearRoutine();
        setError(result.success ? "" : result.message);
        if (result.success) { setConfirmClear(false); setMessage("Tu rutina se vació correctamente."); }
    }
    return <>
        <section className="training-routine-summary" aria-label="Resumen de mi rutina">
            <dl><div><dt>Ejercicios</dt><dd>{routine.items.length}</dd></div><div><dt>Series totales</dt><dd>{routine.items.reduce((sum, item) => sum + item.sets, 0)}</dd></div></dl>
            <Link className="btn btn-success" to="/entrenamiento">Agregar ejercicios</Link>
        </section>
        {message && <p className="auth-form-success" role="status">{message}</p>}
        {error && !confirmClear && <p className="auth-form-alert" role="alert">{error}</p>}
        {routine.items.length ? <>
            <div className="training-routine-list">{routine.items.map(item => <RoutineItem key={item.id} item={item}
                exercise={exercises.find(exercise => exercise.id === item.id)} onUpdate={updateRoutineExercise} onRemove={remove} />)}</div>
            <div className="mt-4"><Button variant="secondary" onClick={() => { setError(""); setMessage(""); setConfirmClear(true); }}>Vaciar rutina</Button></div>
        </> : <div className="training-empty"><i className="bi bi-clipboard2-pulse" aria-hidden="true" /><h2>Tu rutina está vacía</h2>
            <p>Agrega ejercicios desde la biblioteca de entrenamiento.</p><Link className="btn btn-success" to="/entrenamiento">Explorar ejercicios</Link></div>}
        {confirmClear && <ConfirmDeleteDialog title="Vaciar mi rutina" description="¿Deseas eliminar todos los ejercicios de tu rutina?"
            confirmLabel="Vaciar rutina" onCancel={() => { setConfirmClear(false); setError(""); }} onConfirm={clear} error={error} />}
    </>;
}

export default RoutineBuilder;
