// Decide si se muestra un contenido según los permisos de la sesión.

import useAuth from "../../hooks/useAuth.js";

function RoleGate({ permission, children, fallback = null }) {
    const { hasPermission } = useAuth();
    return hasPermission(permission) ? children : fallback;
}

export default RoleGate;
