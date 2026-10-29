// Muestra una cifra del panel junto con su título e icono.
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
