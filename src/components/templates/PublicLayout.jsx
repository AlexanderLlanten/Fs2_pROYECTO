import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Footer from "../organisms/Footer.jsx";
import Navbar from "../organisms/Navbar.jsx";

function PublicLayout() {
    const { pathname, hash } = useLocation();

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
