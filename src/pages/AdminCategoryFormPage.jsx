import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import CategoryForm from "../components/organisms/CategoryForm.jsx";
import { categoryApi } from "../services/api/categories.js";

function Editor({id}) {
    const editing = id !== undefined; const resource = useApiResource(editing ? `/categories/${id}` : null);
    const navigate = useNavigate(); const [stale,setStale] = useState(false);
    async function submit(name) {
        const result = await categoryApi.save(name,editing ? resource.data : null);
        if (result.success) navigate("/admin/categorias", { replace:true,state:{notice:editing ? "Categoría actualizada correctamente." : "Categoría creada correctamente."} });
        else if (editing && result.conflict) setStale(true);
        return result;
    }
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">CATEGORÍAS KYNEX</p><h1>{editing ? "Editar categoría" : "Nueva categoría"}</h1></div></header>
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <div className="auth-form-panel kynex-admin-user-form">
            <h2>Datos de la categoría</h2>
            {stale && <div className="auth-form-alert" role="status"><p>Hay un conflicto con la categoría. Se conservó tu borrador.</p>
                <button className="btn btn-outline-light" type="button" onClick={() => { setStale(false); void resource.reload(); }}>Recargar datos</button></div>}
            <CategoryForm category={resource.data} disabled={stale} onSubmit={submit} />
        </div>}
    </>;
}
export default function AdminCategoryFormPage() { const {id} = useParams(); return <Editor key={id || "new"} id={id} />; }
