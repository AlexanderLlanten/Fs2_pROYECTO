// Muestra una característica mediante icono, título, descripción y una acción opcional.

import { Link } from "react-router-dom";

function FeatureCard({ icon, title, children, action }) {
    return (
        <article className="home-feature-card">
            <span className="home-card-icon">
                <i className={`bi ${icon}`} aria-hidden="true" />
            </span>
            <h3>{title}</h3>
            <p>{children}</p>
            {action && <Link className="home-feature-link" to={action.to}>
                {action.label}<i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>}
        </article>
    );
}

export default FeatureCard;
