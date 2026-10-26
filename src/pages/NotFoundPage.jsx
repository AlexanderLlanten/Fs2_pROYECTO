import { Link } from "react-router-dom";

function NotFoundPage({ admin = false }) {
    return (
        <section className="container py-5">
            <p className="kynex-eyebrow">ERROR 404</p>
            <h1>Página no encontrada</h1>
            <p className="text-secondary">La dirección que buscas no está disponible.</p>
            <Link className="btn btn-outline-light" to={admin ? "/admin" : "/productos"}>
                {admin ? "Volver al panel" : "Volver a la tienda"}
            </Link>
        </section>
    );
}

export default NotFoundPage;
