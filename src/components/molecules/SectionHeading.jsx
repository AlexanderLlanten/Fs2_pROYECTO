/*
 * Molécula reutilizable.
 * Reúne antetítulo, título y descripción para mantener una estructura visual consistente entre
 * secciones.
 */

function SectionHeading({ id, eyebrow, title, description }) {
    return (
        <div className="home-section-heading">
            <p className="kynex-eyebrow">{eyebrow}</p>
            <h2 id={id}>{title}</h2>
            <p>{description}</p>
        </div>
    );
}

export default SectionHeading;
