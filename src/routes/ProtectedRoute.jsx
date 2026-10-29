/*
 * Navegación y acceso.
 * Consulta sesión y permiso antes de montar las rutas hijas. Redirige al acceso conservando el origen
 * o al destino permitido para el perfil.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { getRoleHome } from "../utils/permissions.js";

function ProtectedRoute({ permission }) {
    const { user, isAuthenticated, hasPermission } = useAuth();
    const { pathname, search } = useLocation();

    // Se conserva la dirección solicitada en state.from para poder regresar después de iniciar
    // sesión.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: { pathname, search } }} />;
    }

    if (permission !== undefined && !hasPermission(permission)) {
        return <Navigate to={getRoleHome(user.role)} replace />;
    }

    // Outlet presenta la ruta hija únicamente después de superar las comprobaciones de acceso.
    return <Outlet />;
}

export default ProtectedRoute;
