/*
 * Hook reutilizable de React.
 * Mantiene el resultado de listar usuarios y una recarga reutilizable. Escucha cambios de usuarios o
 * sesión en otras pestañas.
 */

import { useCallback, useEffect, useState } from "react";
import { listManagedUsers } from "../services/adminUsers.js";
import { SESSION_KEY, USERS_KEY } from "../services/auth.js";

function useManagedUsers() {
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [result, setResult] = useState(listManagedUsers);
    // La recarga actualiza el resultado y lo devuelve al consumidor; el servicio vuelve a comprobar
    // la autorización.
    const reload = useCallback(() => { const next = listManagedUsers(); setResult(next); return next; }, []);

    // Los cambios de usuarios o sesión de otras pestañas solicitan otra lectura y comprobación de
    // permisos.
    useEffect(() => {
        // Manejador que filtra eventos de almacenamiento relevantes antes de actualizar el recurso o
        // la sesión.
        function handleStorage(event) {
            if ((!event.storageArea || event.storageArea === localStorage) && [USERS_KEY, SESSION_KEY, null].includes(event.key)) reload();
        }
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [reload]);
    return { ...result, reload };
}

export default useManagedUsers;
