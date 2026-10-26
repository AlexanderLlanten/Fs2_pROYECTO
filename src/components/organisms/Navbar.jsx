import { useEffect, useId, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import BrandLink from "../atoms/BrandLink.jsx";
import useCart from "../../hooks/useCart.js";

function Navbar() {
    const { totalItems } = useCart();
    const { key } = useLocation();
    const menuId = useId();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [key]);

    function closeMenu() {
        setIsMenuOpen(false);
    }

    return (
        <header className="kynex-header">
            <nav
                className="navbar navbar-expand-lg navbar-dark"
                aria-label="Navegación principal"
            >
                <div className="container">
                    <BrandLink className="navbar-brand" onClick={closeMenu} />

                    <button
                        className="navbar-toggler"
                        type="button"
                        aria-controls={menuId}
                        aria-expanded={isMenuOpen}
                        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        onClick={() => setIsMenuOpen(current => !current)}
                    >
                        <span className="navbar-toggler-icon" aria-hidden="true" />
                    </button>

                    <div
                        className={`collapse navbar-collapse${isMenuOpen ? " show" : ""}`}
                        id={menuId}
                    >
                        <ul className="navbar-nav mx-auto mb-3 mb-lg-0">
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
                        </ul>

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
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
