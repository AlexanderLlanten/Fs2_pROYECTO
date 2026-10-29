/*
 * Plantilla compartida.
 * Reúne Navbar, el contenido de la ruta mediante Outlet y Footer. Proporciona un destino principal y
 * un enlace de salto para navegación por teclado.
 */

import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Footer from "../organisms/Footer.jsx";
import Navbar from "../organisms/Navbar.jsx";

function PublicLayout() {
    const { pathname, hash } = useLocation();

    // Antes de pintar una ruta nueva se vuelve al inicio, salvo cuando la dirección contiene un
    // destino de sección con hash.
    useLayoutEffect(() => {
        if (!hash) {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
    }, [pathname, hash]);

    return (
        <div className="kynex-public-layout">
            <a className="kynex-skip-link" href="#main-content">
                Saltar al contenido principal
            </a>
            <Navbar />
            <main id="main-content" className="kynex-main" tabIndex={-1}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default PublicLayout;
