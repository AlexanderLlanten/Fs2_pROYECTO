import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import DeleteUserDialog from "../components/molecules/DeleteUserDialog.jsx";
import UsersTable from "../components/organisms/UsersTable.jsx";
import { accountApi } from "../services/api/users.js";

export default function ApiAdminUsersPage() {
    const resource = useApiResource("/admin/users"); const { user } = useAuth(); const { state } = useLocation();
    const [notice,setNotice] = useState(state?.notice || ""); const [selected,setSelected] = useState(null);
    const [busy,setBusy] = useState(false); const [error,setError] = useState("");
    async function change(account, activating = false) {
        if (busy) return; setBusy(true); setError(""); setNotice("");
        try {
            const result = await (activating ? accountApi.activate(account.id,account.version) : accountApi.deactivate(account.id,account.version));
            if (result.success) { setSelected(null); setNotice(activating ? "Cuenta reactivada correctamente." : "Cuenta desactivada. Su historial se conserva."); await resource.reload(); }
            else setError(result.message);
        } finally { setBusy(false); }
    }
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">GESTIÓN KYNEX</p><h1>Usuarios</h1><p>Administra las cuentas y perfiles registrados.</p></div>
            <Link className="btn btn-success" to="/admin/usuarios/nuevo">Nuevo usuario</Link></header>
        {notice && <p className="auth-form-alert auth-form-success" role="status">{notice}</p>}
        {error && !selected && <p className="auth-form-alert" role="alert">{error}</p>}
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <>
            <p className="kynex-users-count">{resource.data.length} usuarios registrados</p>
            <UsersTable users={resource.data} currentUserId={user.id} remote busy={busy} onActivate={account => change(account,true)}
                onDelete={account => { setSelected(account); setError(""); setNotice(""); }} />
            <button className="btn btn-outline-light mt-3" disabled={busy} onClick={() => { setError(""); void resource.reload(); }}>Actualizar listado</button>
        </>}
        {selected && <DeleteUserDialog user={selected} remote busy={busy} error={error} onConfirm={() => change(selected)} onCancel={() => { setSelected(null); setError(""); }} />}
    </>;
}
