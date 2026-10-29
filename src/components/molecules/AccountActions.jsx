// Muestra acciones de la cuenta, como iniciar sesión, salir o acceder a administración.

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import { PERMISSIONS } from "../../utils/permissions.js";
import RoleGate from "./RoleGate.jsx";

function AccountActions({ onNavigate, showAdminLink = true }) {
    const { user, logout } = useAuth();
    const { pathname, search } = useLocation();
    const [error, setError] = useState("");

    useEffect(() => setError(""), [user]);

    function handleLogout() {
        const result = logout();
        if (!result.success) {
            setError(result.message);
            return;
        }

        setError("");
        onNavigate?.();
    }

    if (!user) {
        return (
            <NavLink
                className="kynex-account-link"
                to="/login"
                state={{ from: { pathname, search } }}
                onClick={onNavigate}
            >
                <i className="bi bi-person" aria-hidden="true" />
                Iniciar sesión
            </NavLink>
        );
    }

    return (
        <div className="kynex-account">
            <div className="kynex-account-session">
                <p className="kynex-account-user" title={`${user.firstName} ${user.lastName}`}>
                    <span>{user.firstName}</span>
                    <small>{user.role}</small>
                </p>
                {showAdminLink && (
                    <RoleGate permission={PERMISSIONS.ADMIN_ACCESS}>
                        <NavLink className="kynex-account-link" to="/admin" onClick={onNavigate}>
                            <i className="bi bi-grid-1x2" aria-hidden="true" />Administración
                        </NavLink>
                    </RoleGate>
                )}
                <button type="button" className="kynex-account-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right" aria-hidden="true" />
                    Cerrar sesión
                </button>
            </div>
            {error && <p className="kynex-account-error" role="alert">{error}</p>}
        </div>
    );
}

export default AccountActions;
