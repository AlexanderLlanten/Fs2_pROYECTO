import { Outlet } from "react-router-dom";

import Footer from "../organisms/Footer.jsx";
import Navbar from "../organisms/Navbar.jsx";

function PublicLayout() {
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
