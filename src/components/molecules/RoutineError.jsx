/*
 * Molécula reutilizable.
 * Presenta un error de lectura de la rutina y una acción para volver a cargar el recurso.
 */

import Button from "../atoms/Button.jsx";

function RoutineError({ resource }) {
    return <div className="auth-form-alert" role="alert"><p>{resource.message}</p>
        <Button variant="secondary" onClick={resource.reload}>Reintentar lectura de rutina</Button>
    </div>;
}

export default RoutineError;
