import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ContactStatus from "../components/atoms/ContactStatus.jsx";
import ContactClaimForm from "../components/organisms/ContactClaimForm.jsx";
import { contactApi } from "../services/api/contact.js";

export default function MyContactPage() {
    const [page, setPage] = useState(0); const resource = useApiResource(`/my/contact?page=${page}`); const navigate = useNavigate();
    async function claim(reference) { const result = await contactApi.claim(reference); if (result.success) navigate(`/consultas/${result.detail.id}`); return result; }
    return <section className="container my-5"><p className="kynex-eyebrow">MI KYNEX</p><h1>Mis consultas</h1>
        <p><Link to="/perfil">Volver a Mi perfil</Link></p>
        <p>Consulta tus mensajes y las respuestas del equipo KYNEX.</p><Link className="btn btn-success mb-4" to="/contacto">Nueva consulta</Link>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <>
            {resource.data.items.length ? <div className="d-grid gap-3">{resource.data.items.map(message => <article className="auth-form-panel contact-original" key={message.id}>
                <h2 className="h4">Consulta #{message.id}</h2><ContactStatus status={message.status} />
                <p className="contact-text mt-3">{message.preview}</p><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString("es-CL")}</time>
                <p className="mt-3 mb-0"><Link to={`/consultas/${message.id}`}>Ver consulta y respuestas #{message.id}</Link></p>
            </article>)}</div> : <p role="status">No tienes consultas vinculadas a tu cuenta.</p>}
            <nav className="contact-pagination" aria-label="Páginas de mis consultas">
                <button className="btn btn-outline-light" disabled={page === 0} onClick={() => setPage(current => current - 1)}>Anterior</button>
                <span>Página {page + 1} de {Math.max(1, resource.data.totalPages)}</span>
                <button className="btn btn-outline-light" disabled={page + 1 >= resource.data.totalPages} onClick={() => setPage(current => current + 1)}>Siguiente</button>
                <button className="btn btn-outline-light" onClick={resource.reload}>Actualizar mis consultas</button>
            </nav>
        </>}
        <section className="auth-form-panel mt-4" aria-labelledby="contact-claim-title"><h2 id="contact-claim-title">Vincular una consulta anterior</h2>
            <p>Si enviaste una consulta sin sesión o con la versión anterior, ingresa su referencia de recepción. El correo original debe coincidir con el de tu cuenta.</p>
            <ContactClaimForm onSubmit={claim} />
        </section>
    </section>;
}
