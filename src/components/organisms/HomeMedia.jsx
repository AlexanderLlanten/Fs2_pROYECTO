import SectionHeading from "../molecules/SectionHeading.jsx";

function HomeMedia() {
    return (
        <section className="home-section" aria-labelledby="media-title">
            <div className="container">
                <SectionHeading id="media-title" eyebrow="APRENDE Y ENTRENA" title="Contenido audiovisual"
                    description="Material complementario relacionado con técnica, entrenamiento y rendimiento." />
                <div className="ratio ratio-16x9 home-video">
                    <iframe src="https://www.youtube.com/embed/UBMk30rjy0o"
                        title="Contenido audiovisual de entrenamiento" loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                </div>
                <a className="home-feature-link" href="https://www.youtube.com/watch?v=UBMk30rjy0o"
                    target="_blank" rel="noopener noreferrer">
                    Ver video en YouTube (nueva pestaña)<i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                </a>
            </div>
        </section>
    );
}

export default HomeMedia;
