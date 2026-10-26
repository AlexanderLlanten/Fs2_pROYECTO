import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminUserForm from "../components/organisms/AdminUserForm.jsx";
import useAuth from "../hooks/useAuth.js";
import { getManagedUser, saveManagedUser } from "../services/adminUsers.js";
import { SESSION_KEY, USERS_KEY } from "../services/auth.js";
import { parseUserId } from "../utils/adminUsers.js";

function AdminUserEditor({ id }) {
    const editing = id !== undefined;
    const [resource, setResource] = useState(() => editing ? getManagedUser(parseUserId(id)) : { success: true, user: null });
    const [revision, setRevision] = useState(0);
    const [stale, setStale] = useState(false);
    const { user, refreshSession } = useAuth();
    const navigate = useNavigate();

    function reload() {
        setResource(editing ? getManagedUser(parseUserId(id)) : { success: true, user: null });
        setRevision(value => value + 1); setStale(false);
    }

    useEffect(() => {
        if (!editing) return;
        function handleStorage(event) {
            if (event.storageArea && event.storageArea !== localStorage) return;
            if (![USERS_KEY, SESSION_KEY, null].includes(event.key)) return;
            const current = getManagedUser(parseUserId(id));
            if (!current.success || JSON.stringify(current.user) !== JSON.stringify(resource.user)) setStale(true);
        }
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [editing, id, resource.user]);

    function handleSubmit(values) {
        const result = saveManagedUser(values, editing ? { id: parseUserId(id), expectedUser: resource.user } : {});
        refreshSession();
        if (result.success) navigate("/admin/usuarios", { replace: true, state: { notice: editing ? "Usuario actualizado correctamente." : "Usuario creado correctamente. Contraseña inicial: 1234." } });
        else if (result.code === "CONFLICT") setStale(true);
        return result;
    }

    return (
        <>
            <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">USUARIOS KYNEX</p><h1>{editing ? "Editar usuario" : "Nuevo usuario"}</h1><p>Completa los datos y selecciona el perfil de la cuenta.</p></div></header>
            {!resource.success ? <div><p className="auth-form-alert" role="alert">{resource.message}</p><div className="auth-form-actions mt-3"><button className="btn btn-outline-light" onClick={reload}>Reintentar</button><Link className="btn btn-outline-light" to="/admin/usuarios">Volver a usuarios</Link></div></div>
                : <div className="auth-form-panel kynex-admin-user-form">
                    <h2>{editing ? "Datos del usuario" : "Crear cuenta"}</h2>
                    {stale && <div className="mb-3"><p role="status">Este usuario cambió en otra pestaña. Recarga los datos antes de guardar.</p><button className="btn btn-outline-light" type="button" onClick={reload}>Recargar datos</button></div>}
                    <AdminUserForm key={revision} initialUser={resource.user} currentUserId={user.id} onSubmit={handleSubmit} disabled={stale} />
                </div>}
        </>
    );
}

function AdminUserFormPage() {
    const { id } = useParams();
    return <AdminUserEditor key={id ?? "new"} id={id} />;
}

export default AdminUserFormPage;
