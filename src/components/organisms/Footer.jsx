import { Link } from "react-router-dom";

import BrandLink from "../atoms/BrandLink.jsx";

function Footer() {
    return (
        <footer className="kynex-footer">
            <div className="container">
                <div className="row gy-4 justify-content-between">
                    <div className="col-12 col-md-7 col-lg-5">
                        <BrandLink />
                        <p className="kynex-footer-description">
                            Plataforma deportiva orientada a suplementación,
                            entrenamiento y rendimiento.
                        </p>
                    </div>

                    <div className="col-12 col-md-4 col-lg-3">
                        <h2 className="kynex-footer-title">Explorar</h2>
                        <nav aria-label="Navegación del pie de página">
                            <ul className="kynex-footer-links">
                                <li><Link to="/">Inicio</Link></li>
                                <li><Link to="/productos">Tienda</Link></li>
                                <li><Link to="/carrito">Carrito</Link></li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="kynex-footer-bottom">
                    <p>© {new Date().getFullYear()} KYNEX. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
