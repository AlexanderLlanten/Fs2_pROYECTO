/*
 * Organismo de interfaz.
 * Presenta el acceso destacado al entrenamiento desde la portada.
 */

import { Link } from "react-router-dom";
import SectionHeading from "../molecules/SectionHeading.jsx";
import trainingImage from "../../../assets/img/training/training-hero-deadlift.jpg";

function TrainingHighlight() {
    return (
        <section className="home-section home-section-soft" aria-labelledby="training-highlight-title">
            <div className="container">
                <div className="row align-items-center gx-4 gy-5">
                    <div className="col-12 col-lg-6">
                        <img className="home-training-image" src={trainingImage}
                            alt="Entrenamiento de fuerza en KYNEX Training" loading="lazy" />
                    </div>
                    <div className="col-12 col-lg-6 home-training-content">
                        <SectionHeading id="training-highlight-title" eyebrow="ENTRENA CON PROPÓSITO"
                            title="Del suplemento al entrenamiento"
                            description="KYNEX complementa la experiencia de compra con una biblioteca de ejercicios organizada por grupo muscular, equipamiento y nivel de dificultad." />
                        <p>Explora ejercicios, agrégalos a tu rutina y ajusta las series y repeticiones.</p>
                        <div className="home-actions">
                            <Link className="btn home-primary-link" to="/entrenamiento">Explorar ejercicios</Link>
                            <Link className="btn btn-outline-light" to="/rutina">Mi rutina</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TrainingHighlight;
