import { Link } from "react-router-dom";
import InventorySummary from "../components/organisms/InventorySummary.jsx";
import useCatalog from "../hooks/useCatalog.js";
import CatalogError from "../components/molecules/CatalogError.jsx";
import useAuth from "../hooks/useAuth.js";
import AdminModuleCard from "../components/molecules/AdminModuleCard.jsx";
import { PERMISSIONS } from "../utils/permissions.js";

const modules = [
    { title: "Productos", description: "Consulta precios, disponibilidad y alertas de stock.", icon: "bi-box-seam", to: "/admin/productos", action: "Consultar productos", permission: PERMISSIONS.PRODUCTS_VIEW },
    { title: "Usuarios", description: "Administra los datos y perfiles de las cuentas registradas.", icon: "bi-people", to: "/admin/usuarios", action: "Gestionar usuarios", permission: PERMISSIONS.USERS_MANAGE },
    { title: "Pedidos", description: "Consulta clientes, productos y estados de los pedidos.", icon: "bi-receipt", to: "/admin/pedidos", action: "Consultar pedidos", permission: PERMISSIONS.ORDERS_VIEW }
];

function AdminHomePage() {
    const { user, hasPermission } = useAuth();
    const catalog = useCatalog();

    return (
        <>
            <header className="kynex-admin-heading">
                <div>
                    <p className="kynex-eyebrow">KYNEX ADMIN</p>
                    <h1>Panel de administración</h1>
                    <p>Bienvenido, {user.firstName}. Consulta el estado del catálogo KYNEX.</p>
                </div>
                <Link className="btn btn-outline-light" to="/productos"><i className="bi bi-shop me-2" aria-hidden="true" />Ver tienda</Link>
            </header>
            {catalog.success ? <InventorySummary products={catalog.products} /> : <CatalogError resource={catalog} />}
            <section className="mt-5" aria-labelledby="admin-modules-title">
                <p className="kynex-eyebrow">MÓDULOS</p><h2 id="admin-modules-title">Gestión KYNEX</h2>
                <p className="kynex-users-count mb-4">Selecciona una de las áreas disponibles para comenzar.</p>
                <div className="row g-4">{modules.filter(module => hasPermission(module.permission)).map(module => (
                    <div className="col-md-6 col-xl-4" key={module.to}><AdminModuleCard {...module} /></div>
                ))}</div>
            </section>
            <section className="kynex-admin-info" aria-labelledby="admin-profile-title">
                <i className="bi bi-shield-check" aria-hidden="true" />
                <div>
                    <p className="kynex-eyebrow">MI CUENTA</p>
                    <h2 id="admin-profile-title">Sesión de gestión activa</h2>
                    <p>Has ingresado como {user.firstName} {user.lastName}, con perfil <strong>{user.role}</strong>.</p>
                    <p>Las opciones disponibles en el panel se adaptan al perfil de tu sesión.</p>
                    <p className="mb-0">Puedes volver a la tienda desde el menú y cerrar tu sesión al terminar.</p>
                </div>
            </section>
        </>
    );
}

export default AdminHomePage;
