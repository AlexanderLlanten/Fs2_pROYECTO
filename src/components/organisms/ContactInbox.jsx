import { Link } from "react-router-dom";
import ContactStatus from "../atoms/ContactStatus.jsx";

const date = value => new Date(value).toLocaleString("es-CL");

export default function ContactInbox({ inbox }) {
    return inbox.items.length ? <div className="table-responsive kynex-users-table-wrap" role="region" aria-label="Listado de solicitudes" tabIndex={0}><table className="table kynex-users-table align-middle">
        <caption className="visually-hidden">Solicitudes de contacto</caption>
        <thead><tr><th scope="col">Solicitud</th><th scope="col">Remitente</th><th scope="col">Recepción</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead>
        <tbody>{inbox.items.map(message => <tr key={message.id}>
            <td>#{message.id}</td><td>{message.name}<small className="d-block">{message.email}</small></td>
            <td><time dateTime={message.createdAt}>{date(message.createdAt)}</time></td><td><ContactStatus status={message.status} /></td>
            <td><Link className="btn btn-outline-light btn-sm" to={`/admin/contacto/${message.id}`} aria-label={`Ver solicitud ${message.id} de ${message.name}`}>Ver solicitud</Link></td>
        </tr>)}</tbody>
    </table></div> : <p className="kynex-users-count" role="status">No hay solicitudes para este filtro.</p>;
}
