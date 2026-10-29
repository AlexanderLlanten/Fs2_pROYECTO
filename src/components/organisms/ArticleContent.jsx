/*
 * Organismo de interfaz.
 * Presenta el contenido completo de un artículo mediante elementos React, incluidos párrafos, listas
 * e imagen. No inyecta una cadena de HTML.
 */

import { Link } from "react-router-dom";
import ArticleImage from "../atoms/ArticleImage.jsx";
import Badge from "../atoms/Badge.jsx";

function ArticleContent({ article }) {
    return <article className="blog-article" aria-label={article.title}>
        <ArticleImage src={article.image} alt={article.imageAlt} className="blog-article-image" />
        <div className="blog-article-meta"><Badge>{article.category}</Badge>
            <span><i className="bi bi-clock" aria-hidden="true" /> Lectura breve</span>
        </div>
        <div className="blog-article-content">
            <p>{article.intro}</p>
            {article.sections.map(section => <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                {section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
            </section>)}
            <aside className="blog-article-note" aria-labelledby={`${article.slug}-note`}>
                <h2 id={`${article.slug}-note`}>{article.note.title}</h2><p>{article.note.text}</p>
            </aside>
        </div>
        <Link className="btn btn-outline-light mt-5" to="/blog"><i className="bi bi-arrow-left me-2" aria-hidden="true" />Volver al blog</Link>
    </article>;
}

export default ArticleContent;
