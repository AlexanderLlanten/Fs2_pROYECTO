import useAuth from "../../hooks/useAuth.js";

function RoleGate({ permission, children, fallback = null }) {
    const { hasPermission } = useAuth();
    return hasPermission(permission) ? children : fallback;
}

export default RoleGate;
