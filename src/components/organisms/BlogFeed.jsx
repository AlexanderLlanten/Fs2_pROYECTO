import BlogCard from "../molecules/BlogCard.jsx";
import SectionHeading from "../molecules/SectionHeading.jsx";

function BlogFeed({ articles }) {
    return <section className="home-section" aria-labelledby="blog-feed-title"><div className="container">
        <SectionHeading id="blog-feed-title" eyebrow="CONTENIDO DESTACADO" title="Aprende más sobre rendimiento"
            description="Revisa contenidos informativos relacionados con el ecosistema KYNEX." />
        <div className="blog-grid">{articles.map(article => <BlogCard key={article.slug} article={article} />)}</div>
    </div></section>;
}

export default BlogFeed;
