import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useCatalog from "../hooks/useCatalog.js";
import { getManagedProduct, saveManagedProduct } from "../services/adminProducts.js";
import { parseProductId } from "../utils/products.js";
import AdminProductForm from "../components/organisms/AdminProductForm.jsx";

function ProductEditor({ id }) {
    const editing = id !== undefined;
    const [resource, setResource] = useState(() => editing ? getManagedProduct(parseProductId(id)) : { success: true, product: null });
    const [revision, setRevision] = useState(0);
    const [stale, setStale] = useState(false);
    const catalog = useCatalog();
    const { refreshSession } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!editing || !resource.success) return;
        const current = catalog.products.find(product => product.id === parseProductId(id));
        if (!catalog.success || JSON.stringify(current) !== JSON.stringify(resource.product)) setStale(true);
    }, [editing, id, resource, catalog.products, catalog.success]);
    function reload() {
        setResource(editing ? getManagedProduct(parseProductId(id)) : { success: true, product: null });
        setRevision(value => value + 1); setStale(false);
    }
    function handleSubmit(values) {
        const result = saveManagedProduct(values, editing ? { id: parseProductId(id), expectedProduct: resource.product } : {});
        refreshSession();
        if (result.success) navigate("/admin/productos", { replace: true, state: { notice: editing ? "Producto actualizado correctamente." : "Producto creado correctamente." } });
        else if (result.code === "CONFLICT") setStale(true);
        return result;
    }
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">CATÁLOGO KYNEX</p><h1>{editing ? "Editar producto" : "Nuevo producto"}</h1><p>Completa los datos, el precio y las existencias del producto.</p></div></header>
        {!resource.success ? <div><p className="auth-form-alert" role="alert">{resource.message}</p><div className="auth-form-actions mt-3"><button className="btn btn-outline-light" onClick={reload}>Reintentar</button><Link className="btn btn-outline-light" to="/admin/productos">Volver a productos</Link></div></div>
            : <div className="auth-form-panel kynex-admin-user-form">
                <h2>Datos del producto</h2>
                {stale && <div className="mb-3"><p role="status">Este producto cambió en otra pestaña. Recarga los datos antes de guardar.</p><button className="btn btn-outline-light" type="button" onClick={reload}>Recargar datos</button></div>}
                <AdminProductForm key={revision} initialProduct={resource.product} onSubmit={handleSubmit} disabled={stale} />
            </div>}
    </>;
}

function AdminProductFormPage() {
    const { id } = useParams();
    return <ProductEditor key={id ?? "new"} id={id} />;
}

export default AdminProductFormPage;
