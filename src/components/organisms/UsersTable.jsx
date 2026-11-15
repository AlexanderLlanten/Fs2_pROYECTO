/*
 * Organismo de interfaz.
 * Presenta usuarios y acciones autorizadas. Identifica la cuenta conectada para evitar ofrecer su
 * eliminación.
 */

import { Link } from "react-router-dom";

function UsersTable({ users, currentUserId, onDelete, remote = false, onActivate, busy = false }) {
    if (!users.length) return <p role="status">No hay usuarios registrados.</p>;

    return (
        <div className="table-responsive kynex-users-table-wrap" tabIndex={0} role="region" aria-label="Listado de usuarios">
            <table className="table align-middle kynex-users-table">
                <caption className="visually-hidden">Usuarios registrados en KYNEX</caption>
                <thead><tr>{["RUN", "Usuario", "Correo", "Región", "Comuna", "Perfil", ...(remote ? ["Estado"] : []), "Acciones"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
                <tbody>{users.map(user => (
                    <tr key={user.id}>
                        <td>{user.run || "—"}</td>
                        <th scope="row">{user.firstName} {user.lastName}</th>
                        <td>{user.email}</td><td>{user.region || "—"}</td><td>{user.commune || "—"}</td>
                        <td><span className="kynex-badge">{user.role}</span></td>
                        {remote && <td>{user.active ? "Activa" : "Inactiva"}</td>}
                        <td><div className="kynex-user-actions">
                            <Link className="btn btn-outline-light btn-sm" to={`/admin/usuarios/${user.id}/editar`} aria-label={`Editar a ${user.firstName} ${user.lastName}`}><i className="bi bi-pencil" aria-hidden="true" />Editar</Link>
                            {user.id === currentUserId ? <span className="kynex-current-user">Sesión actual</span>
                                : remote && !user.active ? <button className="btn btn-outline-success btn-sm" type="button" disabled={busy} onClick={() => onActivate(user)} aria-label={`Reactivar a ${user.firstName} ${user.lastName}`}>Reactivar</button>
                                : <button className="btn btn-outline-danger btn-sm" type="button" disabled={busy} onClick={() => onDelete(user)} aria-label={`${remote ? "Desactivar" : "Eliminar"} a ${user.firstName} ${user.lastName}`}><i className="bi bi-trash" aria-hidden="true" />{remote ? "Desactivar" : "Eliminar"}</button>}
                        </div></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
}

export default UsersTable;
