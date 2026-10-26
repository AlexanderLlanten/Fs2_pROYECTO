import { useState } from "react";

function ArticleImage({ src, alt, className = "" }) {
    const [failed, setFailed] = useState(null);
    return <div className={`blog-image ${className}`.trim()}>
        {src && failed !== src
            ? <img src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} />
            : <div className="blog-image-fallback" role="img" aria-label={alt}>
                <i className="bi bi-journal-text" aria-hidden="true" /><span>Imagen no disponible</span>
            </div>}
    </div>;
}

export default ArticleImage;
