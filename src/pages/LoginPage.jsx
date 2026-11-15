/*
 * Página y coordinación de la vista.
 * Conecta LoginForm con la sesión compartida y decide el destino después de autenticar. Presenta las
 * cuentas demostrativas disponibles.
 */

import { Link, Navigate, useLocation } from "react-router-dom";

import LoginForm from "../components/organisms/LoginForm.jsx";
import { defaultUsers } from "../data/users.js";
import useAuth from "../hooks/useAuth.js";
import { getLoginDestination } from "../utils/authRedirect.js";
import SessionStatus from "../components/molecules/SessionStatus.jsx";

function LoginPage() {
    const { user, isAuthenticated, login, isRemote, isLoading, sessionError, retrySession } = useAuth();
    const { state } = useLocation();
    const destination = getLoginDestination(state?.from, user?.role);

    if (isLoading || sessionError) return <SessionStatus loading={isLoading} error={sessionError} onRetry={retrySession} />;
    if (isAuthenticated) {
        return <Navigate to={destination} replace />;
    }

    return (
        <>
            <section className="auth-page-header">
                <div className="container">
                    <p className="kynex-eyebrow">MI KYNEX</p>
                    <h1>Iniciar sesión</h1>
                    <p>Accede a tu cuenta y continúa tu experiencia KYNEX.</p>
                </div>
            </section>
            <section className="auth-section" aria-labelledby="login-form-title">
                <div className="container">
                    <div className="auth-layout">
                        <div className="auth-form-panel">
                            <p className="kynex-eyebrow">ACCESO</p>
                            <h2 id="login-form-title">Bienvenido de vuelta</h2>
                            <p className="auth-form-intro">Ingresa tus credenciales para acceder a tu cuenta KYNEX.</p>
                            <LoginForm onSubmit={login} remote={isRemote} />
                            <p className="auth-registration-link">¿Aún no tienes cuenta? <Link to="/registro" state={state}>Crear cuenta</Link></p>
                        </div>
                        {isRemote ? <aside className="auth-side-panel" aria-labelledby="account-security-title">
                            <i className="bi bi-person-circle auth-side-icon" aria-hidden="true" />
                            <h2 id="account-security-title">Tu cuenta KYNEX</h2>
                            <p>Accede con el correo y la contraseña que elegiste al crear tu cuenta.</p>
                            <p>Cierra la sesión al terminar si utilizas un equipo compartido.</p>
                        </aside> : <aside className="auth-side-panel" aria-labelledby="demo-accounts-title">
                            <i className="bi bi-person-circle auth-side-icon" aria-hidden="true" />
                            <h2 id="demo-accounts-title">Cuentas de demostración</h2>
                            <p>Prueba la experiencia con uno de los perfiles iniciales. Su contraseña es <strong>1234</strong>.</p>
                            <dl className="auth-demo-users">
                                {defaultUsers.map(user => (
                                    <div key={user.id}>
                                        <dt>{user.role}</dt>
                                        <dd>{user.email}</dd>
                                    </div>
                                ))}
                            </dl>
                        </aside>}
                    </div>
                </div>
            </section>
        </>
    );
}

export default LoginPage;
