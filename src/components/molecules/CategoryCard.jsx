import { Link } from "react-router-dom";

function CategoryCard({ category }) {
    const search = new URLSearchParams({ categoria: category.name }).toString();

    return (
        <Link
            className="home-category-card"
            to={`/productos?${search}`}
            aria-label={`Explorar ${category.name}`}
        >
            <span className="home-card-icon">
                <i className={`bi ${category.icon}`} aria-hidden="true" />
            </span>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span className="home-category-action" aria-hidden="true">
                Explorar <i className="bi bi-arrow-up-right" />
            </span>
        </Link>
    );
}

export default CategoryCard;
