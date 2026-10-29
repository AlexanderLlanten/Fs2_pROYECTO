// Lista usuarios y presenta las acciones autorizadas sobre sus cuentas.

import { Link } from "react-router-dom";

function UsersTable({ users, currentUserId, onDelete }) {
    if (!users.length) return <p role="status">No hay usuarios registrados.</p>;

    return (
        <div className="table-responsive kynex-users-table-wrap" tabIndex={0} role="region" aria-label="Listado de usuarios">
            <table className="table align-middle kynex-users-table">
                <caption className="visually-hidden">Usuarios registrados en KYNEX</caption>
                <thead><tr>{["RUN", "Usuario", "Correo", "Región", "Comuna", "Perfil", "Acciones"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
                <tbody>{users.map(user => (
                    <tr key={user.id}>
                        <td>{user.run || "—"}</td>
                        <th scope="row">{user.firstName} {user.lastName}</th>
                        <td>{user.email}</td><td>{user.region || "—"}</td><td>{user.commune || "—"}</td>
                        <td><span className="kynex-badge">{user.role}</span></td>
                        <td><div className="kynex-user-actions">
                            <Link className="btn btn-outline-light btn-sm" to={`/admin/usuarios/${user.id}/editar`} aria-label={`Editar a ${user.firstName} ${user.lastName}`}><i className="bi bi-pencil" aria-hidden="true" />Editar</Link>
                            {user.id === currentUserId ? <span className="kynex-current-user">Sesión actual</span>
                                : <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => onDelete(user)} aria-label={`Eliminar a ${user.firstName} ${user.lastName}`}><i className="bi bi-trash" aria-hidden="true" />Eliminar</button>}
                        </div></td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
}

export default UsersTable;
