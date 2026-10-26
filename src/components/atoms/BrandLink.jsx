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
