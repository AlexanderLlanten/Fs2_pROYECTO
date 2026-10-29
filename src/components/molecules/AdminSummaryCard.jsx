// Presenta el resumen de un artículo y el enlace para leerlo.
function AdminSummaryCard({ label, value, icon }) {
    return (
        <article className="kynex-admin-stat" aria-label={label}>
            <i className={`bi ${icon}`} aria-hidden="true" />
            <p>{label}</p>
            <strong>{value}</strong>
        </article>
    );
}

export default AdminSummaryCard;
