/*
 * Página y coordinación de la vista.
 * Muestra usuarios y coordina la eliminación confirmada. Mantiene mensajes y selección mientras el
 * servicio comprueba permiso y datos vigentes.
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DeleteUserDialog from "../components/molecules/DeleteUserDialog.jsx";
import UsersTable from "../components/organisms/UsersTable.jsx";
import useAuth from "../hooks/useAuth.js";
import useManagedUsers from "../hooks/useManagedUsers.js";
import { deleteManagedUser } from "../services/adminUsers.js";

function AdminUsersPage() {
    const { user, refreshSession } = useAuth();
    const resource = useManagedUsers();
    const { state } = useLocation();
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [notice, setNotice] = useState(state?.notice ?? "");
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [busy, setBusy] = useState(false);

    // Coordina una eliminación desde la página, usando el registro seleccionado y mostrando éxito o
    // error.
    async function handleDelete() {
        if (busy) return;
        setBusy(true); setDeleteError("");
        const result = deleteManagedUser(selectedUser.id, selectedUser);
        if (result.success) {
            setSelectedUser(null); setNotice("Usuario eliminado correctamente.");
        } else setDeleteError(result.message);
        resource.reload(); refreshSession(); setBusy(false);
    }

    return (
        <>
            <header className="kynex-admin-heading">
                <div><p className="kynex-eyebrow">GESTIÓN KYNEX</p><h1>Usuarios</h1><p>Administra los datos y perfiles de las cuentas registradas.</p></div>
                <Link className="btn btn-success" to="/admin/usuarios/nuevo"><i className="bi bi-person-plus me-2" aria-hidden="true" />Nuevo usuario</Link>
            </header>
            {notice && <p className="auth-form-alert auth-form-success mb-4" role="status">{notice}</p>}
            {resource.success ? <>
                <p className="kynex-users-count">{resource.users.length} usuarios registrados</p>
                <UsersTable users={resource.users} currentUserId={user.id} onDelete={selected => { setSelectedUser(selected); setDeleteError(""); setNotice(""); }} />
            </> : <div><p className="auth-form-alert" role="alert">{resource.message}</p><button className="btn btn-outline-light mt-3" type="button" onClick={resource.reload}>Reintentar</button></div>}
            {selectedUser && <DeleteUserDialog user={selectedUser} busy={busy} error={deleteError} onConfirm={handleDelete} onCancel={() => setSelectedUser(null)} />}
        </>
    );
}

export default AdminUsersPage;
