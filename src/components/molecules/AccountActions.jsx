/*
 * Molécula reutilizable.
 * Muestra las acciones correspondientes a la sesión. Permite salir, presenta un error si falla la
 * operación y ofrece administración cuando el perfil está autorizado.
 */

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import { PERMISSIONS } from "../../utils/permissions.js";
import RoleGate from "./RoleGate.jsx";

function AccountActions({ onNavigate, showAdminLink = true }) {
    const { user, logout, isLoading, sessionError, retrySession, isRemote } = useAuth();
    const { pathname, search } = useLocation();
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // El efecto sincroniza el componente después del renderizado; su función de retorno, cuando
    // existe, retira lo que se registró.
    useEffect(() => setError(""), [user]);

    // Solicita el cierre de sesión y actualiza mensajes o navegación según su resultado.
    async function handleLogout() {
        if (busy) return;
        setBusy(true);
        const result = await logout();
        setBusy(false);
        if (!result.success) {
            setError(result.message);
            return;
        }

        setError("");
        onNavigate?.();
    }

    if (isLoading) return <p className="kynex-account-user" role="status">Recuperando sesión…</p>;
    if (!user) {
        return (
            <div>
            <NavLink
                className="kynex-account-link"
                to="/login"
                state={{ from: { pathname, search } }}
                onClick={onNavigate}
            >
                <i className="bi bi-person" aria-hidden="true" />
                Iniciar sesión
            </NavLink>
            {sessionError && <div role="alert" className="kynex-account-error"><p>{sessionError}</p>
                <button type="button" className="kynex-account-link" onClick={retrySession} disabled={busy}>Reintentar</button>
            </div>}
            </div>
        );
    }

    return (
        <div className="kynex-account">
            <div className="kynex-account-session">
                <p className="kynex-account-user" title={`${user.firstName} ${user.lastName}`}>
                    <span>{user.firstName}</span>
                    <small>{user.role}</small>
                </p>
                {isRemote && <NavLink className="kynex-account-link" to="/compras" onClick={onNavigate}>Mis compras</NavLink>}
                {showAdminLink && (
                    <RoleGate permission={PERMISSIONS.ADMIN_ACCESS}>
                        <NavLink className="kynex-account-link" to="/admin" onClick={onNavigate}>
                            <i className="bi bi-grid-1x2" aria-hidden="true" />Administración
                        </NavLink>
                    </RoleGate>
                )}
                <button type="button" className="kynex-account-logout" onClick={handleLogout} disabled={busy}>
                    <i className="bi bi-box-arrow-right" aria-hidden="true" />
                    Cerrar sesión
                </button>
            </div>
            {error && <p className="kynex-account-error" role="alert">{error}</p>}
        </div>
    );
}

export default AccountActions;
