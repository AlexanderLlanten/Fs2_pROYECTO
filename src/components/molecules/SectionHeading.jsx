// Mantiene una presentación común para los títulos y descripciones de las secciones.

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
