/*
 * Molécula reutilizable.
 * Decide si se presenta su contenido según un permiso de la sesión. Puede mostrar un reemplazo; los
 * servicios también vuelven a verificar los permisos.
 */

import useAuth from "../../hooks/useAuth.js";

function RoleGate({ permission, children, fallback = null }) {
    const { hasPermission } = useAuth();
    return hasPermission(permission) ? children : fallback;
}

export default RoleGate;
