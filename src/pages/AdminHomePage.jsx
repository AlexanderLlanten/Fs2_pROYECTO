import { Link } from "react-router-dom";
import InventorySummary from "../components/organisms/InventorySummary.jsx";
import { products } from "../data/products.js";
import useAuth from "../hooks/useAuth.js";
import RoleGate from "../components/molecules/RoleGate.jsx";
import { PERMISSIONS } from "../utils/permissions.js";

function AdminHomePage() {
    const { user } = useAuth();

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
            <InventorySummary products={products} />
            <RoleGate permission={PERMISSIONS.USERS_MANAGE}>
                <section className="kynex-admin-info" aria-labelledby="users-module-title">
                    <i className="bi bi-people" aria-hidden="true" />
                    <div><p className="kynex-eyebrow">ACCESOS</p><h2 id="users-module-title">Usuarios</h2><p>Consulta las cuentas y administra sus datos y perfiles.</p><Link className="btn btn-outline-light" to="/admin/usuarios">Gestionar usuarios</Link></div>
                </section>
            </RoleGate>
            <section className="kynex-admin-info" aria-labelledby="admin-profile-title">
                <i className="bi bi-shield-check" aria-hidden="true" />
                <div>
                    <p className="kynex-eyebrow">MI CUENTA</p>
                    <h2 id="admin-profile-title">Sesión de gestión activa</h2>
                    <p>Has ingresado como {user.firstName} {user.lastName}, con perfil <strong>{user.role}</strong>.</p>
                    <p className="mb-0">Puedes volver a la tienda desde el menú y cerrar tu sesión al terminar.</p>
                </div>
            </section>
        </>
    );
}

export default AdminHomePage;
