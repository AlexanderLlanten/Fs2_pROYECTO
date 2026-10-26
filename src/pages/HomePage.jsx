import {
    Link
} from "react-router-dom";

function HomePage() {
    return (
        <>
            <section className="kynex-hero">
                <div className="container py-5">
                    <div className="row align-items-center min-vh-75">
                        <div className="col-12 col-lg-8">
                            <p className="kynex-eyebrow mb-2">
                                KYNEX · FRONTEND REACT
                            </p>

                            <h1 className="display-3 fw-bold mb-3">
                                La evolución de KYNEX comienza aquí.
                            </h1>

                            <p className="lead text-secondary mb-4">
                                Primera etapa de la migración desde HTML y
                                JavaScript Vanilla hacia React, Vite,
                                Bootstrap y Vitest.
                            </p>

                            <Link
                                className="btn btn-success"
                                to="/productos"
                            >
                                Explorar productos
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default HomePage;
