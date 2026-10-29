/*
 * Página y coordinación de la vista.
 * Consulta el catálogo administrativo y coordina confirmación y eliminación. Mantiene avisos y
 * respeta la diferencia entre consulta y gestión.
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useCatalog from "../hooks/useCatalog.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { deleteManagedProduct } from "../services/adminProducts.js";
import CatalogError from "../components/molecules/CatalogError.jsx";
import ConfirmDeleteDialog from "../components/molecules/ConfirmDeleteDialog.jsx";
import ProductsTable from "../components/organisms/ProductsTable.jsx";

function AdminProductsPage() {
    const catalog = useCatalog();
    const { hasPermission, refreshSession } = useAuth();
    const canManage = hasPermission(PERMISSIONS.PRODUCTS_MANAGE);
    const { state } = useLocation();
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [notice, setNotice] = useState(state?.notice ?? "");
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    // Coordina una eliminación desde la página, usando el registro seleccionado y mostrando éxito o
    // error.
    function handleDelete() {
        if (busy) return;
        setBusy(true); setError("");
        const result = deleteManagedProduct(selected.id, selected);
        if (result.success) { setSelected(null); setNotice("Producto eliminado correctamente."); }
        else setError(result.message);
        refreshSession(); setBusy(false);
    }
    return <>
        <header className="kynex-admin-heading">
            <div><p className="kynex-eyebrow">GESTIÓN KYNEX</p><h1>Productos</h1><p>Consulta el catálogo, sus precios y existencias.</p></div>
            {canManage && <Link className="btn btn-success" to="/admin/productos/nuevo"><i className="bi bi-plus-lg me-2" aria-hidden="true" />Nuevo producto</Link>}
        </header>
        {notice && <p className="auth-form-alert auth-form-success" role="status">{notice}</p>}
        {!canManage && <p className="kynex-users-count">Modo consulta. La edición del catálogo corresponde al Administrador.</p>}
        {!catalog.success ? <CatalogError resource={catalog} /> : <>
            <p className="kynex-users-count">{catalog.products.length} productos registrados</p>
            <ProductsTable products={catalog.products} canManage={canManage} onDelete={product => { setSelected(product); setError(""); setNotice(""); }} />
        </>}
        {selected && <ConfirmDeleteDialog title="Eliminar producto" confirmLabel="Eliminar producto" busy={busy} error={error}
            onCancel={() => setSelected(null)} onConfirm={handleDelete}
            description={<>¿Deseas eliminar <strong>{selected.name}</strong> ({selected.code})? Dejará de estar disponible en la tienda y en el carrito.</>} />}
    </>;
}

export default AdminProductsPage;
