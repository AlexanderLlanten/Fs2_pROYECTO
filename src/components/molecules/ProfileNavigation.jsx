import { Link } from "react-router-dom";

const sections = [
    { to: "/compras", title: "Mis compras", description: "Revisa tus pedidos, sus estados y el detalle de cada compra.", icon: "bi-bag-check" },
    { to: "/consultas", title: "Mis consultas", description: "Consulta tus mensajes y las respuestas del equipo KYNEX.", icon: "bi-chat-dots" }
];

/** Agrupa la actividad personal; cada enlace abre su página protegida. */
export default function ProfileNavigation() {
    return <section className="mb-5" aria-labelledby="profile-activity-title">
        <h2 id="profile-activity-title" className="mb-3">Mi actividad</h2>
        <nav aria-label="Actividad de mi cuenta" className="row g-3">
            {sections.map(section => <div className="col-md-6" key={section.to}>
                <Link className="auth-form-panel kynex-profile-link" to={section.to} aria-label={section.title}>
                    <i className={`bi ${section.icon}`} aria-hidden="true" />
                    <h3 className="h4 mt-3">{section.title}</h3><p className="mb-0">{section.description}</p>
                </Link>
            </div>)}
        </nav>
    </section>;
}
