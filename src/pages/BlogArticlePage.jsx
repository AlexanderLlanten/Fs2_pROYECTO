/*
 * Página y coordinación de la vista.
 * Busca el artículo cuyo slug aparece en la ruta y presenta la lectura completa o el estado de
 * artículo inexistente.
 */

import { Link, useParams } from "react-router-dom";
import ArticleContent from "../components/organisms/ArticleContent.jsx";
import { articles } from "../data/articles.js";

function BlogArticlePage() {
    const { slug } = useParams();
    // slug es el nombre legible recibido de la URL; si no identifica un artículo se presenta el
    // estado de contenido inexistente.
    const article = articles.find(article => article.slug === slug);
    if (!article) return <section className="container py-5">
        <p className="kynex-eyebrow">ERROR 404</p><h1>Artículo no encontrado</h1>
        <p className="text-secondary">El contenido que buscas no está disponible.</p>
        <Link className="btn btn-outline-light" to="/blog">Volver al blog</Link>
    </section>;

    return <>
        <section className="auth-page-header"><div className="container">
            <p className="kynex-eyebrow">{article.category}</p><h1>{article.title}</h1><p>{article.subtitle}</p>
        </div></section>
        <section className="home-section"><div className="container"><ArticleContent article={article} /></div></section>
    </>;
}

export default BlogArticlePage;
