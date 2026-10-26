import { useId, useLayoutEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import BrandLink from "../atoms/BrandLink.jsx";
import AccountActions from "../molecules/AccountActions.jsx";
import RoleGate from "../molecules/RoleGate.jsx";
import { PERMISSIONS } from "../../utils/permissions.js";

function AdminLayout() {
    const [isOpen, setIsOpen] = useState(false);
    const menuId = useId();
    const { pathname, hash } = useLocation();

    useLayoutEffect(() => {
        setIsOpen(false);
        if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname, hash]);

    return (
        <div className="kynex-admin-layout">
            <a className="kynex-skip-link" href="#admin-main-content">Saltar al contenido principal</a>
            <aside className="kynex-admin-sidebar" aria-label="Menú administrativo">
                <div className="kynex-admin-brand-row">
                    <div><BrandLink /><span className="kynex-admin-tag">ADMIN</span></div>
                    <button className="navbar-toggler d-lg-none" type="button" aria-controls={menuId}
                        aria-expanded={isOpen} aria-label={isOpen ? "Cerrar menú administrativo" : "Abrir menú administrativo"}
                        onClick={() => setIsOpen(open => !open)}>
                        <i className={`bi ${isOpen ? "bi-x-lg" : "bi-list"}`} aria-hidden="true" />
                    </button>
                </div>
                <div id={menuId} className={`kynex-admin-menu ${isOpen ? "is-open" : ""}`}>
                    <AccountActions showAdminLink={false} />
                    <nav aria-label="Navegación administrativa">
                        <p className="kynex-eyebrow">GESTIÓN</p>
                        <ul>
                            <li><NavLink to="/admin" end onClick={() => setIsOpen(false)}><i className="bi bi-grid-1x2" aria-hidden="true" />Panel principal</NavLink></li>
                            <RoleGate permission={PERMISSIONS.USERS_MANAGE}><li><NavLink to="/admin/usuarios" onClick={() => setIsOpen(false)}><i className="bi bi-people" aria-hidden="true" />Usuarios</NavLink></li></RoleGate>
                            <li><Link to="/productos" onClick={() => setIsOpen(false)}><i className="bi bi-shop" aria-hidden="true" />Volver a la tienda</Link></li>
                        </ul>
                    </nav>
                </div>
            </aside>
            <div className="kynex-admin-content">
                <main id="admin-main-content" className="kynex-admin-main" tabIndex={-1}><Outlet /></main>
                <footer className="kynex-admin-footer"><p>© {new Date().getFullYear()} KYNEX.</p><p>Panel administrativo</p></footer>
            </div>
        </div>
    );
}

export default AdminLayout;
