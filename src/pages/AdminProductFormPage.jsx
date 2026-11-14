/*
 * Página y coordinación de la vista.
 * Distingue creación y edición por la ruta. Carga el producto esperado, entrega el guardado al
 * servicio y conserva control de conflictos y navegación.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import useCatalog from "../hooks/useCatalog.js";
import { getManagedProduct, saveManagedProduct } from "../services/adminProducts.js";
import { parseProductId } from "../utils/products.js";
import AdminProductForm from "../components/organisms/AdminProductForm.jsx";
import { usesApi } from "../config/dataSource.js";
import { api } from "../services/api/client.js";

function ProductEditor({ id }) {
    const editing = id !== undefined;
    // El editor conserva el registro cargado, una revisión para reiniciar el formulario y el aviso de
    // datos modificados.
    const [resource, setResource] = useState(() => editing ? getManagedProduct(parseProductId(id)) : { success: true, product: null });
    const [revision, setRevision] = useState(0);
    const [stale, setStale] = useState(false);
    const catalog = useCatalog();
    const { refreshSession } = useAuth();
    const navigate = useNavigate();
    // El catálogo actual se compara con la copia del editor. Si cambió, se bloquea guardar hasta
    // recargar los datos.
    useEffect(() => {
        if (!editing || !resource.success) return;
        const current = catalog.products.find(product => product.id === parseProductId(id));
        if (!catalog.success || JSON.stringify(current) !== JSON.stringify(resource.product)) setStale(true);
    }, [editing, id, resource, catalog.products, catalog.success]);
    function reload() {
        setResource(editing ? getManagedProduct(parseProductId(id)) : { success: true, product: null });
        setRevision(value => value + 1); setStale(false);
    }
    // El servicio recibe la copia esperada del producto. Un conflicto obliga a recargar; un éxito
    // vuelve al listado con un aviso.
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

// La key reinicia el editor al pasar de un identificador a otro o a una creación nueva, evitando
// conservar el formulario anterior.
function AdminProductFormPage() {
    const { id } = useParams();
    if (usesApi) return <RemoteProductEditor key={id ?? "new"} id={id} />;
    return <ProductEditor key={id ?? "new"} id={id} />;
}

function RemoteProductEditor({ id }) {
    const editing = id !== undefined;
    const [revision, setRevision] = useState(0);
    const [resource, setResource] = useState({ loading: true });
    const [stale, setStale] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        let active = true;
        setResource({ loading: true });
        Promise.all([api("/categories"), editing ? getManagedProduct(parseProductId(id)) : Promise.resolve({ success: true, product: null })])
            .then(([categories, result]) => { if (active) setResource({ ...result, categories, loading: false }); })
            .catch(error => { if (active) setResource({ success: false, loading: false, message: error.message }); });
        return () => { active = false; };
    }, [id, editing, revision]);
    async function submit(values) {
        const result = await saveManagedProduct(values, editing ? { id: parseProductId(id), expectedProduct: resource.product } : {});
        if (result.success) navigate("/admin/productos", { replace: true, state: { notice: editing ? "Producto actualizado correctamente." : "Producto creado correctamente." } });
        else if (result.code === "CONFLICT") setStale(true);
        return result;
    }
    return <>
        <header className="kynex-admin-heading"><div><p className="kynex-eyebrow">CATÁLOGO KYNEX</p><h1>{editing ? "Editar producto" : "Nuevo producto"}</h1></div></header>
        {resource.loading ? <p role="status">Cargando datos del producto…</p> : !resource.success ? <div className="auth-form-alert" role="alert"><p>{resource.message}</p><button className="btn btn-outline-light" onClick={() => setRevision(value => value + 1)}>Reintentar</button></div>
            : <div className="auth-form-panel kynex-admin-user-form"><h2>Datos del producto</h2>
                {stale && <div className="auth-form-alert" role="alert"><p>El producto cambió. Recarga sus datos antes de guardar.</p><button className="btn btn-outline-light" onClick={() => { setStale(false); setRevision(value => value + 1); }}>Recargar datos</button></div>}
                <AdminProductForm key={revision} initialProduct={resource.product} onSubmit={submit} disabled={stale}
                    categories={resource.categories.map(category => category.name)} remote />
            </div>}
    </>;
}

export default AdminProductFormPage;
