/*
 * Átomo reutilizable.
 * Muestra la imagen de un artículo con texto alternativo. Recuerda la dirección que falló y ofrece un
 * respaldo visual; una dirección nueva puede volver a intentarse.
 */

import { useState } from "react";

function ArticleImage({ src, alt, className = "" }) {
    // failed guarda la dirección que no cargó. null indica que todavía no se ha registrado un error
    // de imagen.
    const [failed, setFailed] = useState(null);
    // Si existe src y esa dirección no falló, se muestra img. onError guarda la dirección fallida y
    // React presenta el icono de reemplazo.
    return <div className={`blog-image ${className}`.trim()}>
        {src && failed !== src
            ? <img src={src} alt={alt} loading="lazy" onError={() => setFailed(src)} />
            : <div className="blog-image-fallback" role="img" aria-label={alt}>
                <i className="bi bi-journal-text" aria-hidden="true" /><span>Imagen no disponible</span>
            </div>}
    </div>;
}

export default ArticleImage;
