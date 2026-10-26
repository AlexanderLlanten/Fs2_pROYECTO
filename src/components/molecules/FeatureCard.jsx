function FeatureCard({ icon, title, children }) {
    return (
        <article className="home-feature-card">
            <span className="home-card-icon">
                <i className={`bi ${icon}`} aria-hidden="true" />
            </span>
            <h3>{title}</h3>
            <p>{children}</p>
        </article>
    );
}

export default FeatureCard;
