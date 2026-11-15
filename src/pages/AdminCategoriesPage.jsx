import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useApiResource from "../hooks/useApiResource.js";
import ApiResourceState from "../components/molecules/ApiResourceState.jsx";
import ConfirmDeleteDialog from "../components/molecules/ConfirmDeleteDialog.jsx";
import CategoriesTable from "../components/organisms/CategoriesTable.jsx";
import { categoryApi } from "../services/api/categories.js";

export default function AdminCategoriesPage() {
    const resource = useApiResource("/categories"); const { state } = useLocation();
    const [notice,setNotice] = useState(state?.notice || ""); const [selected,setSelected] = useState(null);
    const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
    async function deactivate() {
        if (busy) return; setBusy(true); setError("");
        try {
            const result = await categoryApi.deactivate(selected);
            if (result.success) { setSelected(null); setNotice("Categoría desactivada correctamente."); await resource.reload(); }
            else setError(result.message);
        } finally { setBusy(false); }
    }
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">CATÁLOGO KYNEX</p><h1>Categorías</h1><p>Organiza los productos mediante categorías activas.</p></div>
            <Link className="btn btn-success" to="/admin/categorias/nuevo">Nueva categoría</Link></header>
        {notice && <p className="auth-form-alert auth-form-success" role="status">{notice}</p>}
        {resource.loading || resource.error ? <ApiResourceState resource={resource} /> : <>
            <p className="kynex-users-count">{resource.data.length} categorías activas</p>
            <CategoriesTable categories={resource.data} busy={busy} onDeactivate={category => { setSelected(category); setError(""); setNotice(""); }} />
            <button type="button" className="btn btn-outline-light mt-3" disabled={busy} onClick={resource.reload}>Actualizar listado</button>
        </>}
        {selected && <ConfirmDeleteDialog title="Desactivar categoría" confirmLabel="Desactivar categoría" busyLabel="Desactivando…" busy={busy} error={error}
            description={<>¿Deseas desactivar <strong>{selected.name}</strong>? No podrá tener productos activos. Sus referencias históricas se conservarán.</>}
            onConfirm={deactivate} onCancel={() => { setSelected(null); setError(""); }} />}
    </>;
}
