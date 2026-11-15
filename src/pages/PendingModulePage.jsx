import { Link } from "react-router-dom";

function PendingModulePage({ title }) {
    return <section className="container my-5"><h1>{title}</h1>
        <p>Esta sección estará disponible próximamente.</p>
        <Link className="btn btn-outline-light" to="/admin">Volver al panel</Link>
    </section>;
}
export default PendingModulePage;
