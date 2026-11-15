import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import useAuth from "../hooks/useAuth.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import AdminUserForm from "../components/organisms/AdminUserForm.jsx";
import { accountApi } from "../services/api/users.js";

function Editor({ id }) {
    const editing = id !== undefined; const resource = useApiResource(editing ? `/admin/users/${id}` : null);
    const { user,refreshSession } = useAuth(); const navigate = useNavigate(); const [stale,setStale] = useState(false);
    async function submit(values) {
        const result = await (editing ? accountApi.update(resource.data.id,resource.data.version,values) : accountApi.create(values));
        if (result.success) {
            if (editing && resource.data.id === user.id) await refreshSession();
            navigate("/admin/usuarios", { replace:true,state:{ notice:editing ? "Usuario actualizado correctamente." : "Usuario creado correctamente." } });
        } else if (result.code === "CONFLICT") setStale(true);
        return result;
    }
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">USUARIOS KYNEX</p><h1>{editing ? "Editar usuario" : "Nuevo usuario"}</h1></div></header>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <div className="auth-form-panel kynex-admin-user-form">
            <h2>{editing ? "Datos del usuario" : "Crear cuenta"}</h2>
            {stale && <div className="auth-form-alert" role="status"><p>La cuenta cambió o los datos están en conflicto. Recarga antes de guardar.</p>
                <button type="button" className="btn btn-outline-light" onClick={() => { setStale(false); void resource.reload(); }}>Recargar datos</button></div>}
            <AdminUserForm initialUser={resource.data} currentUserId={user.id} remote onSubmit={submit} disabled={stale} />
        </div>}
    </>;
}
export default function ApiAdminUserFormPage() {
    const {id} = useParams(); return <Editor key={id || "new"} id={id} />;
}
