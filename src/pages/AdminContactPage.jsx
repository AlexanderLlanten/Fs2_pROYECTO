import { useState } from "react";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ContactInbox from "../components/organisms/ContactInbox.jsx";
import { CONTACT_STATUSES } from "../components/atoms/ContactStatus.jsx";

export default function AdminContactPage() {
    const [status, setStatus] = useState(""); const [page, setPage] = useState(0);
    const resource = useApiResource(`/admin/contact?page=${page}${status ? `&status=${status}` : ""}`);
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">ATENCIÓN KYNEX</p><h1>Solicitudes de contacto</h1><p>Consulta los mensajes recibidos y registra su atención interna.</p></div></header>
        <div className="contact-inbox-controls"><label htmlFor="contact-filter">Filtrar por estado</label>
            <select id="contact-filter" className="auth-input" value={status} onChange={event => { setStatus(event.target.value); setPage(0); }}>
                <option value="">Todos los estados</option>{Object.entries(CONTACT_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select><button type="button" className="btn btn-outline-light" disabled={resource.loading} onClick={resource.reload}>Actualizar bandeja</button>
        </div>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <>
            <p className="kynex-users-count">{resource.data.totalElements} solicitudes</p><ContactInbox inbox={resource.data} />
            <nav className="contact-pagination" aria-label="Páginas de solicitudes">
                <button type="button" className="btn btn-outline-light" disabled={page === 0} onClick={() => setPage(current => current - 1)}>Anterior</button>
                <span>Página {page + 1} de {Math.max(1, resource.data.totalPages)}</span>
                <button type="button" className="btn btn-outline-light" disabled={page + 1 >= resource.data.totalPages} onClick={() => setPage(current => current + 1)}>Siguiente</button>
            </nav>
        </>}
    </>;
}
