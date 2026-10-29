/*
 * Molécula reutilizable.
 * Presenta una cifra administrativa con etiqueta e icono. El cálculo se realiza antes de entregar el
 * valor al componente.
 */

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
