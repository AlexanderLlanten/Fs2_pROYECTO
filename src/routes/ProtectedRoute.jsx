import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { getRoleHome } from "../utils/permissions.js";

function ProtectedRoute({ permission }) {
    const { user, isAuthenticated, hasPermission } = useAuth();
    const { pathname, search } = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: { pathname, search } }} />;
    }

    if (permission !== undefined && !hasPermission(permission)) {
        return <Navigate to={getRoleHome(user.role)} replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
