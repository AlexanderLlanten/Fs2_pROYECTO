/*
 * Hook reutilizable de React.
 * Accede a AuthContext. Si se invoca fuera de AuthProvider, lanza un error claro para detectar una
 * composición incorrecta.
 */

import { useContext } from "react";

import { AuthContext } from "../context/AuthContext.jsx";

function useAuth() {
    const context = useContext(AuthContext);

    // Esta comprobación detecta que el consumidor quedó fuera del proveedor; evita utilizar una
    // sesión inexistente por un error de composición.
    if (!context) {
        throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
    }

    return context;
}

export default useAuth;
