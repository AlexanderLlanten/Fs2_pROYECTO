// Impide redirigir o presentar contenido privado mientras se recupera una identidad.
function SessionStatus({ loading, error, onRetry }) {
    if (loading) return <p className="container my-4" role="status">Recuperando sesión…</p>;
    return <div className="container my-4 auth-form-alert" role="alert">
        <p>{error}</p><button className="btn btn-outline-light" type="button" onClick={onRetry}>Reintentar sesión</button>
    </div>;
}
export default SessionStatus;
