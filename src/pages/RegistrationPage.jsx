import { Navigate, useLocation } from "react-router-dom";
import RegistrationForm from "../components/organisms/RegistrationForm.jsx";
import useAuth from "../hooks/useAuth.js";
import { getLoginDestination } from "../utils/authRedirect.js";

function RegistrationPage() {
    const { user, isAuthenticated, register } = useAuth();
    const { state } = useLocation();
    if (isAuthenticated) return <Navigate to={getLoginDestination(state?.from, user?.role)} replace />;

    return (
        <>
            <section className="auth-page-header">
                <div className="container">
                    <p className="kynex-eyebrow">MI KYNEX</p>
                    <h1>Crear cuenta</h1>
                    <p>Forma parte del ecosistema KYNEX.</p>
                </div>
            </section>
            <section className="auth-section" aria-labelledby="registration-form-title">
                <div className="container">
                    <div className="auth-layout">
                        <div className="auth-form-panel">
                            <p className="kynex-eyebrow">REGISTRO</p>
                            <h2 id="registration-form-title">Crea tu perfil</h2>
                            <p className="auth-form-intro">Completa tus datos. Los campos con asterisco son obligatorios.</p>
                            <RegistrationForm onSubmit={register} loginState={state} />
                        </div>
                        <aside className="auth-side-panel" aria-labelledby="registration-info-title">
                            <i className="bi bi-person-plus auth-side-icon" aria-hidden="true" />
                            <h2 id="registration-info-title">Únete a KYNEX</h2>
                            <p>Crea tu cuenta de cliente para continuar tu experiencia de suplementación y entrenamiento.</p>
                            <div className="auth-registration-note">
                                <p>En esta demostración tu contraseña inicial será <strong>1234</strong>.</p>
                                <p className="mb-0">Después del registro podrás iniciar sesión con tu correo.</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}

export default RegistrationPage;
