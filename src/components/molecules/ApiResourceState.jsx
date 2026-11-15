function ApiResourceState({ resource }) {
    return resource.loading ? <p role="status">Cargando información…</p> : <div className="auth-form-alert" role="alert">
        <p>{resource.error}</p><button className="btn btn-outline-light" type="button" onClick={resource.reload}>Reintentar consulta</button>
    </div>;
}
export default ApiResourceState;
