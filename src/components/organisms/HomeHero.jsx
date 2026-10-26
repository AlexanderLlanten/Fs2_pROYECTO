import { Link } from "react-router-dom";

import heroImage from "../../../assets/img/brand/kynex-hero-home.jpg";

function HomeHero() {
    return (
        <section className="home-hero kynex-hero" aria-labelledby="home-title">
            <div className="container">
                <div className="row align-items-center g-5">
                    <div className="col-12 col-lg-6">
                        <p className="kynex-eyebrow">KYNEX PERFORMANCE</p>
                        <h1 id="home-title">
                            Entrena mejor. <span>Supérate.</span>
                        </h1>
                        <p className="home-hero-description">
                            Suplementación deportiva para acompañar tus objetivos.
                            Explora el catálogo, conoce cada producto y prepara tu
                            próxima compra en un solo lugar.
                        </p>
                        <div className="home-actions">
                            <Link className="btn home-primary-link" to="/productos">
                                Explorar productos
                                <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
                            </Link>
                            <a className="btn btn-outline-light" href="#productos-destacados">
                                Ver destacados
                            </a>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div className="home-hero-visual">
                            <img
                                src={heroImage}
                                alt="Productos KYNEX en un entorno de entrenamiento"
                                width="1672"
                                height="941"
                                fetchPriority="high"
                            />
                            <div className="home-hero-caption">
                                <span>KYNEX PERFORMANCE</span>
                                <strong>Constancia. Fuerza. Evolución.</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeHero;
