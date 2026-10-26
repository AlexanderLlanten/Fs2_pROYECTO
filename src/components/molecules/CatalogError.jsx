function CatalogError({ resource }) {
    return <div className="auth-form-alert my-4" role="alert">
        <p>{resource.message}</p>
        <button className="btn btn-outline-light" type="button" onClick={resource.reload}>Reintentar catálogo</button>
    </div>;
}

export default CatalogError;
