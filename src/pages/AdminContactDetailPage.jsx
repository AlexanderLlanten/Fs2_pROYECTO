import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ContactStatus from "../components/atoms/ContactStatus.jsx";
import ContactAttentionForm from "../components/organisms/ContactAttentionForm.jsx";
import ContactReplyForm from "../components/organisms/ContactReplyForm.jsx";
import ContactReplies from "../components/organisms/ContactReplies.jsx";
import { contactApi } from "../services/api/contact.js";
import { parseUserId } from "../utils/adminUsers.js";

const date = value => new Date(value).toLocaleString("es-CL");

export default function AdminContactDetailPage() {
    const { id } = useParams(); const validId = parseUserId(id);
    const resource = useApiResource(validId ? `/admin/contact/${validId}` : null);
    const [stale, setStale] = useState(false); const [notice, setNotice] = useState("");
    const [linking, setLinking] = useState(false); const [linkError, setLinkError] = useState("");
    async function linkAccount() {
        if (linking) return; setLinking(true); setLinkError(""); setNotice("");
        try { const result = await contactApi.linkAccount(resource.data);
            if (result.success) { resource.update(result.detail); setNotice("Consulta vinculada a la cuenta del remitente."); }
            else { setLinkError(result.message); if (result.conflict) setStale(true); }
        } finally { setLinking(false); }
    }
    async function save(values) {
        setNotice(""); const result = await contactApi.attend(resource.data, values);
        if (result.success) { resource.update(result.detail); setNotice("Atención guardada correctamente."); }
        else if (result.conflict) setStale(true);
        return result;
    }
    async function reply(text, key) {
        setNotice(""); const result = await contactApi.reply(resource.data, text, key);
        if (result.success) { resource.update(result.detail); setNotice("Respuesta publicada para el usuario."); }
        else if (result.conflict) setStale(true);
        return result;
    }
    if (!validId) return <><h1>Solicitud no encontrada</h1><Link to="/admin/contacto">Volver a solicitudes</Link></>;
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">ATENCIÓN KYNEX</p><h1>Solicitud #{validId}</h1></div><Link className="btn btn-outline-light" to="/admin/contacto">Volver a solicitudes</Link></header>
        {notice && <p className="auth-form-alert auth-form-success" role="status">{notice}</p>}
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : resource.data && <>
            <section className="auth-form-panel contact-original" aria-labelledby="contact-original-title"><h2 id="contact-original-title">Mensaje recibido</h2>
                <dl><dt>Remitente</dt><dd>{resource.data.name}</dd><dt>Correo electrónico</dt><dd>{resource.data.email}</dd>
                    <dt>Referencia de recepción</dt><dd>{resource.data.reference}</dd>
                    <dt>Recepción</dt><dd><time dateTime={resource.data.createdAt}>{date(resource.data.createdAt)}</time></dd><dt>Estado</dt><dd><ContactStatus status={resource.data.status} /></dd></dl>
                <p className="contact-text">{resource.data.comment}</p>
            </section>
            <section className="auth-form-panel mt-4" aria-labelledby="contact-attention-title"><h2 id="contact-attention-title">Atención interna</h2>
                {stale && <div className="auth-form-alert" role="status"><p>La atención cambió. Se conservó tu borrador; revisa la versión vigente antes de guardar.</p>
                    <button className="btn btn-outline-light" onClick={() => { setStale(false); void resource.reload(); }}>Recargar datos y descartar borrador</button></div>}
                <ContactAttentionForm key={validId} message={resource.data} onSubmit={save} disabled={stale || linking} />
            </section>
            <section className="auth-form-panel mt-4" aria-labelledby="contact-reply-title"><h2 id="contact-reply-title">Respuesta al usuario</h2>
                {!resource.data.linked && <div className="mb-4"><p>Esta consulta es anterior a la vinculación por cuenta. Comprueba que el correo corresponda al remitente y confirma su recuperación a la cuenta activa del mismo correo.</p>
                    <button type="button" className="btn btn-outline-light" disabled={linking || stale} onClick={linkAccount}>{linking ? "Vinculando…" : "Vincular a la cuenta del mismo correo"}</button>
                    {linkError && <p className="auth-form-alert mt-3" role="alert">{linkError}</p>}</div>}
                <ContactReplies replies={resource.data.replies} />
                <ContactReplyForm key={validId} onSubmit={reply} disabled={stale || linking} />
            </section>
            <section className="auth-form-panel mt-4" aria-labelledby="contact-history-title"><h2 id="contact-history-title">Historial de atención</h2>
                {resource.data.history.length ? <ol className="contact-history">{resource.data.history.map((event, index) => <li key={index}>
                    <ContactStatus status={event.status} /><p>{event.actorName} · <time dateTime={event.createdAt}>{date(event.createdAt)}</time></p><p className="contact-text">{event.note || "Sin nota interna."}</p>
                </li>)}</ol> : <p>Todavía no se ha registrado atención.</p>}
            </section>
        </>}
    </>;
}
