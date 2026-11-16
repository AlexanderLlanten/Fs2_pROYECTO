/*
 * Organismo de interfaz.
 * Construye la navegación pública y el contador del carrito. Mantiene apertura del menú móvil y lo
 * cierra al cambiar la ubicación o usar un enlace.
 */

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import BrandLink from "../atoms/BrandLink.jsx";
import AccountActions from "../molecules/AccountActions.jsx";
import useCart from "../../hooks/useCart.js";

function Navbar() {
    const { totalItems } = useCart();
    const { key } = useLocation();
    const menuId = useId();
    const headerRef = useRef(null);
    const toggleRef = useRef(null);
    // El estado recuerda si el menú móvil está abierto; se actualiza al pulsar el control o navegar.
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Cambiar de ruta cierra el menú móvil para que la nueva página quede visible.
    useEffect(() => {
        setIsMenuOpen(false);
    }, [key]);

    // La altura real evita que la cabecera persistente tape anclas o el resumen del carrito.
    useLayoutEffect(() => {
        const root = document.documentElement;
        const previous = root.style.getPropertyValue("--kynex-header-height");
        const measure = () => {
            const height = headerRef.current?.getBoundingClientRect().height;
            if (height > 0) root.style.setProperty("--kynex-header-height", `${Math.ceil(height)}px`);
        };
        measure();
        const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
        if (observer && headerRef.current) observer.observe(headerRef.current);
        window.addEventListener("resize", measure);
        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", measure);
            if (previous) root.style.setProperty("--kynex-header-height", previous);
            else root.style.removeProperty("--kynex-header-height");
        };
    }, []);

    useEffect(() => {
        if (!isMenuOpen) return;
        const closeOutside = event => {
            if (!headerRef.current?.contains(event.target)) setIsMenuOpen(false);
        };
        const closeOnDesktop = () => {
            if (window.innerWidth >= 1200) setIsMenuOpen(false);
        };
        document.addEventListener("pointerdown", closeOutside);
        window.addEventListener("resize", closeOnDesktop);
        return () => {
            document.removeEventListener("pointerdown", closeOutside);
            window.removeEventListener("resize", closeOnDesktop);
        };
    }, [isMenuOpen]);

    // Establece el estado del menú en cerrado.
    function closeMenu() {
        setIsMenuOpen(false);
    }

    function handleKeyDown(event) {
        if (event.key === "Escape" && isMenuOpen) {
            event.preventDefault();
            closeMenu();
            toggleRef.current?.focus();
        }
    }

    return (
        <header className="kynex-header" ref={headerRef}>
            <nav
                className="navbar navbar-expand-xl navbar-dark"
                aria-label="Navegación principal"
                onKeyDown={handleKeyDown}
            >
                <div className="container kynex-navbar-container">
                    <BrandLink className="navbar-brand" onClick={closeMenu} />

                    <div className="kynex-navbar-controls">
                        <NavLink
                            className="kynex-cart-link"
                            to="/carrito"
                            aria-label={`Carrito (${totalItems})`}
                            onClick={closeMenu}
                        >
                            <i className="bi bi-bag" aria-hidden="true" />
                            Carrito
                            <span className="kynex-cart-counter" aria-live="polite" aria-atomic="true">
                                {totalItems}
                            </span>
                        </NavLink>
                        <button
                            ref={toggleRef}
                            className="navbar-toggler"
                            type="button"
                            aria-controls={menuId}
                            aria-expanded={isMenuOpen}
                            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                            onClick={() => setIsMenuOpen(current => !current)}
                        >
                            <span className="navbar-toggler-icon" aria-hidden="true" />
                        </button>
                    </div>

                    <div
                        className={`collapse navbar-collapse${isMenuOpen ? " show" : ""}`}
                        id={menuId}
                    >
                        <ul className="navbar-nav mx-auto mb-3 mb-xl-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/" end onClick={closeMenu}>
                                    Inicio
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/productos" onClick={closeMenu}>
                                    Tienda
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/entrenamiento" onClick={closeMenu}>Entrenamiento</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/rutina" onClick={closeMenu}>Mi rutina</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/blog" onClick={closeMenu}>Blog</NavLink>
                            </li>
                        </ul>

                        <div className="kynex-navbar-actions">
                            <AccountActions onNavigate={closeMenu} />
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
