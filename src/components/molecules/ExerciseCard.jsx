import { useId, useState } from "react";
import Button from "../atoms/Button.jsx";

function ExerciseCard({ exercise, added, disabled, onAdd }) {
    const titleId = useId();
    const [failedImage, setFailedImage] = useState(null);
    return <article className="training-card" aria-labelledby={titleId}>
        <div className="training-card-image">
            {exercise.image && failedImage !== exercise.image
                ? <img src={exercise.image} alt={exercise.name} loading="lazy" onError={() => setFailedImage(exercise.image)} />
                : <i className={`bi ${exercise.icon || "bi-activity"}`} aria-hidden="true" />}
        </div>
        <div className="training-card-content">
            <ul className="training-tags" aria-label="Características del ejercicio">
                {[exercise.muscle, exercise.difficulty, exercise.equipment].map(value => <li key={value}>{value}</li>)}
            </ul>
            <h3 id={titleId}>{exercise.name}</h3><p>{exercise.description}</p>
            <div className="training-prescription">Sugerencia: <strong>{exercise.defaultSets} series × {exercise.defaultReps} repeticiones</strong></div>
            <Button disabled={added || disabled} onClick={() => onAdd(exercise)}>
                {added ? "En mi rutina" : `Agregar ${exercise.name} a mi rutina`}
            </Button>
        </div>
    </article>;
}

export default ExerciseCard;
