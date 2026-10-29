/*
 * Estado compartido mediante contexto de React.
 * Mantiene la sesión de React y expone acceso, salida, registro y comprobación de permisos.
 * Sincroniza el estado al cambiar usuarios o sesión desde otras pestañas.
 */

import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import {
    getSession,
    loginUser,
    logoutUser,
    registerUser,
    SESSION_KEY,
    USERS_KEY
} from "../services/auth.js";
import { hasPermission } from "../utils/permissions.js";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
    // useState conserva la sesión compartida. Se pasa getSession como función para leerla al
    // inicializar el proveedor.
    const [user, setUser] = useState(getSession);

    // Vuelve a consultar al servicio para reflejar cambios de perfil o eliminación de la cuenta;
    // useCallback permite compartir una referencia estable.
    const refreshSession = useCallback(() => {
        const session = getSession();
        setUser(session);
        return session;
    }, []);

    // Solo se actualiza el estado de React cuando el servicio confirma que la sesión fue guardada.
    const login = useCallback((email, password) => {
        const result = loginUser(email, password);

        if (result.success) {
            setUser(result.session);
        }

        return result;
    }, []);

    // Una salida exitosa retira la sesión de la interfaz. El servicio conserva las otras claves, como
    // carrito y rutina.
    const logout = useCallback(() => {
        const result = logoutUser();

        if (result.success) {
            setUser(null);
        }

        return result;
    }, []);

    // storage permite actualizar la sesión cuando otra pestaña modifica usuarios o sesión. Al
    // desmontar se retira el oyente registrado.
    useEffect(() => {
        // Manejador que filtra eventos de almacenamiento relevantes antes de actualizar el recurso o
        // la sesión.
        function handleStorage(event) {
            if (![SESSION_KEY, USERS_KEY, null].includes(event.key)) {
                return;
            }

            if (event.storageArea && event.storageArea !== localStorage) {
                return;
            }

            refreshSession();
        }

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [refreshSession]);

    // Este objeto es la API del contexto: datos de sesión, operaciones y consultas de permiso
    // disponibles mediante useAuth.
    const value = useMemo(() => ({
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        register: registerUser,
        refreshSession,
        hasRole: (...roles) => user !== null && roles.includes(user.role),
        hasPermission: permission => user !== null && hasPermission(user.role, permission)
    }), [user, login, logout, refreshSession]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
