// Muestra artículos destacados en la portada.

import { Link } from "react-router-dom";
import BlogCard from "../molecules/BlogCard.jsx";
import SectionHeading from "../molecules/SectionHeading.jsx";

function HomeArticles({ articles }) {
    return (
        <section className="home-section home-section-soft" aria-labelledby="home-blog-title">
            <div className="container">
                <div className="home-section-top">
                    <SectionHeading id="home-blog-title" eyebrow="KYNEX CONTENT" title="Aprende más"
                        description="Contenido informativo sobre suplementación, entrenamiento y recuperación." />
                    <Link className="btn btn-outline-light" to="/blog">Ver todos los artículos</Link>
                </div>
                <div className="blog-grid">
                    {articles.map(article => <BlogCard key={article.slug} article={article} />)}
                </div>
            </div>
        </section>
    );
}

export default HomeArticles;
