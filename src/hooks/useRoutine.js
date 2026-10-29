/*
 * Hook reutilizable de React.
 * Suscribe React al almacén de rutina y expone su lectura y recarga.
 */

import { useSyncExternalStore } from "react";
import { readRoutine, refreshRoutine, subscribeRoutine } from "../services/routineStore.js";

function useRoutine() {
    // La suscripción actualiza la interfaz ante cambios de rutina. reload permite volver a intentar
    // una lectura fallida.
    const resource = useSyncExternalStore(subscribeRoutine, readRoutine, readRoutine);
    return { ...resource, reload: refreshRoutine };
}

export default useRoutine;
