import { Link } from "react-router-dom";
import BlogFeed from "../components/organisms/BlogFeed.jsx";
import { articles } from "../data/articles.js";

function BlogPage() {
    return <>
        <section className="auth-page-header"><div className="container">
            <p className="kynex-eyebrow">KYNEX CONTENT</p><h1>Blog</h1>
            <p>Información relacionada con suplementación, entrenamiento, recuperación y rendimiento deportivo.</p>
        </div></section>
        <BlogFeed articles={articles} />
        <section className="home-section pt-0" aria-labelledby="blog-cta-title"><div className="container"><div className="home-cta">
            <div><p className="kynex-eyebrow">KYNEX</p><h2 id="blog-cta-title">Complementa tu entrenamiento</h2>
                <p>Explora nuestro catálogo de productos y continúa descubriendo contenido relacionado con rendimiento.</p>
            </div>
            <Link className="btn home-primary-link" to="/productos">Ver productos<i className="bi bi-arrow-right ms-2" aria-hidden="true" /></Link>
        </div></div></section>
    </>;
}

export default BlogPage;
