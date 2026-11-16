/*
 * Organismo de interfaz.
 * Compone el pie público con identidad y enlaces internos compartidos. Permanece bajo el contenido de
 * las rutas públicas.
 */

import { Link } from "react-router-dom";

import BrandLink from "../atoms/BrandLink.jsx";

function Footer() {
    return (
        <footer className="kynex-footer">
            <div className="container">
                <nav className="kynex-footer-grid" aria-label="Navegación del pie de página">
                    <div>
                        <BrandLink />
                        <p className="kynex-footer-description">
                            Plataforma deportiva orientada a suplementación,
                            entrenamiento y rendimiento.
                        </p>
                    </div>

                    <div>
                        <h2 className="kynex-footer-title">Explorar</h2>
                        <ul className="kynex-footer-links">
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/productos">Tienda</Link></li>
                            <li><Link to="/carrito">Carrito</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="kynex-footer-title">Entrenamiento</h2>
                        <ul className="kynex-footer-links">
                            <li><Link to="/entrenamiento">Entrenamiento</Link></li>
                            <li><Link to="/rutina">Mi rutina</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="kynex-footer-title">Empresa</h2>
                        <ul className="kynex-footer-links">
                            <li><Link to="/nosotros">Nosotros</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contacto">Contacto</Link></li>
                        </ul>
                    </div>
                </nav>

                <div className="kynex-footer-bottom">
                    <p>© {new Date().getFullYear()} KYNEX. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
