import { useId } from "react";
import { Link } from "react-router-dom";
import ArticleImage from "../atoms/ArticleImage.jsx";
import Badge from "../atoms/Badge.jsx";

function BlogCard({ article }) {
    const titleId = useId();
    return <article className="blog-card" aria-labelledby={titleId}>
        <ArticleImage src={article.image} alt={article.imageAlt} className="blog-card-image" />
        <div className="blog-card-body">
            <Badge>{article.category}</Badge>
            <h3 id={titleId}>{article.title}</h3><p>{article.excerpt}</p>
            <Link className="blog-read-link" to={`/blog/${article.slug}`} aria-label={`Leer artículo: ${article.title}`}>
                Leer artículo<i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
        </div>
    </article>;
}

export default BlogCard;
