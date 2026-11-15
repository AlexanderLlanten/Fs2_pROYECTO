import { useState } from "react";
import useApiResource from "../hooks/useApiResource.js";
import useAuth from "../hooks/useAuth.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import AdminUserForm from "../components/organisms/AdminUserForm.jsx";
import { accountApi } from "../services/api/users.js";
import ProfileNavigation from "../components/molecules/ProfileNavigation.jsx";

export default function ProfilePage() {
    const resource = useApiResource("/profile"); const { refreshSession } = useAuth();
    const [stale,setStale] = useState(false); const [notice,setNotice] = useState("");
    async function submit(values) {
        setNotice(""); const result = await accountApi.profile(resource.data.version,values);
        if (result.success) { resource.update(result.user); await refreshSession(); setNotice("Perfil actualizado correctamente."); }
        else if (result.code === "CONFLICT") setStale(true);
        return result;
    }
    return <section className="container my-5"><p className="kynex-eyebrow">MI CUENTA</p><h1>Mi perfil</h1>
        <p className="mb-4">Gestiona tus datos personales, compras y consultas en un solo lugar.</p>
        <ProfileNavigation />
        <h2>Datos personales</h2>
        <p>Actualiza tus datos y tu dirección de entrega.</p>
        {notice && <p className="auth-form-alert auth-form-success" role="status">{notice}</p>}
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <div className="auth-form-panel kynex-admin-user-form">
            {stale && <div className="auth-form-alert" role="status"><p>El perfil cambió o los datos están en conflicto. Se conservó el formulario.</p>
                <button className="btn btn-outline-light" onClick={() => { setStale(false); void resource.reload(); }}>Recargar datos</button></div>}
            <AdminUserForm key={resource.data.version} initialUser={resource.data} remote personal onSubmit={submit} disabled={stale} />
        </div>}
    </section>;
}
