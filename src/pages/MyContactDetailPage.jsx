import { Link, useParams } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ContactStatus from "../components/atoms/ContactStatus.jsx";
import ContactReplies from "../components/organisms/ContactReplies.jsx";
import { parseUserId } from "../utils/adminUsers.js";

export default function MyContactDetailPage() {
    const { id } = useParams(); const validId = parseUserId(id); const resource = useApiResource(validId ? `/my/contact/${validId}` : null);
    if (!validId) return <section className="container my-5"><h1>Consulta no encontrada</h1><Link to="/consultas">Volver a mis consultas</Link></section>;
    return <section className="container my-5"><p className="kynex-eyebrow">MI KYNEX</p><h1>Mi consulta #{validId}</h1><Link to="/consultas">Volver a mis consultas</Link>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : resource.data && <>
            <section className="auth-form-panel contact-original mt-4" aria-labelledby="my-message-title"><h2 id="my-message-title">Tu mensaje</h2><ContactStatus status={resource.data.status} />
                <p className="mt-3">Referencia: {resource.data.reference}</p><p className="contact-text">{resource.data.comment}</p>
                <time dateTime={resource.data.createdAt}>{new Date(resource.data.createdAt).toLocaleString("es-CL")}</time>
            </section>
            <section className="auth-form-panel mt-4" aria-labelledby="my-replies-title"><h2 id="my-replies-title">Respuestas de KYNEX</h2><ContactReplies replies={resource.data.replies} /></section>
            <button className="btn btn-outline-light mt-4" onClick={resource.reload}>Actualizar respuestas</button>
        </>}
    </section>;
}
