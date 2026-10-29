/*
 * Átomo reutilizable.
 * Presenta la marca como enlace al inicio y admite una acción al navegar, como cerrar el menú móvil.
 */

import { Link } from "react-router-dom";

function BrandLink({ className = "", onClick }) {
    return (
        <Link
            className={`kynex-brand ${className}`.trim()}
            to="/"
            onClick={onClick}
        >
            KYNEX
        </Link>
    );
}

export default BrandLink;
