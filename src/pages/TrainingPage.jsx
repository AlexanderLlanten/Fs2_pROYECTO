import { useState } from "react";
import { Link } from "react-router-dom";
import { exercises } from "../data/exercises.js";
import useRoutine from "../hooks/useRoutine.js";
import { addRoutineExercise } from "../services/routineStore.js";
import ExerciseLibrary from "../components/organisms/ExerciseLibrary.jsx";
import RoutineError from "../components/molecules/RoutineError.jsx";

function TrainingPage() {
    const routine = useRoutine();
    const [notice, setNotice] = useState(null);
    function add(exercise) {
        const result = addRoutineExercise(exercise.id);
        setNotice({ success: result.success, message: result.success ? `${exercise.name} fue agregado a tu rutina.` : result.message });
    }
    return <>
        <section className="auth-page-header"><div className="container training-heading">
            <div><p className="kynex-eyebrow">KYNEX TRAINING</p><h1>Entrenamiento</h1><p>Explora ejercicios y crea una rutina personalizada utilizando la biblioteca KYNEX.</p></div>
            <Link className="btn btn-outline-light" to="/rutina">Ver mi rutina{routine.success && ` (${routine.items.length})`}</Link>
        </div></section>
        {(!routine.success || notice) && <div className="container pt-4">
            {!routine.success ? <RoutineError resource={routine} /> : <p className={notice.success ? "auth-form-success" : "auth-form-alert"} role={notice.success ? "status" : "alert"}>{notice.message}</p>}
        </div>}
        <ExerciseLibrary exercises={exercises} items={routine.items} disabled={!routine.success} onAdd={add} />
    </>;
}

export default TrainingPage;
