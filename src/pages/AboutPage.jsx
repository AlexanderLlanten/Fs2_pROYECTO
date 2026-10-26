import { Link } from "react-router-dom";
import FeatureCard from "../components/molecules/FeatureCard.jsx";
import SectionHeading from "../components/molecules/SectionHeading.jsx";
import CategoryGrid from "../components/organisms/CategoryGrid.jsx";
import FeatureSection from "../components/organisms/FeatureSection.jsx";
import { aboutCategories, aboutCommitments, aboutExperience, aboutProposal } from "../data/about.js";

function AboutPage() {
    return (
        <>
            <section className="auth-page-header">
                <div className="container">
                    <p className="kynex-eyebrow">SOBRE KYNEX</p>
                    <h1>Nuestra tienda</h1>
                    <p>Una experiencia creada para conectar suplementación, entrenamiento y rendimiento dentro de un mismo ecosistema deportivo.</p>
                </div>
            </section>

            <section className="home-section about-story" aria-labelledby="about-story-title">
                <div className="container"><div className="row align-items-stretch gx-4 gy-5">
                    <div className="col-12 col-lg-6 about-story-copy">
                        <p className="kynex-eyebrow">QUIÉNES SOMOS</p>
                        <h2 id="about-story-title">Una tienda pensada para quienes buscan avanzar</h2>
                        <p>KYNEX es una tienda especializada en suplementación deportiva que busca entregar una experiencia de compra clara, moderna y orientada a distintos objetivos de entrenamiento.</p>
                        <p>Nuestra propuesta reúne productos asociados a fuerza, recuperación, desarrollo muscular, energía y bienestar, complementándolos con información que facilita la elección de cada producto.</p>
                        <p>Además de la tienda, KYNEX incorpora contenido relacionado con entrenamiento y hábitos deportivos para ofrecer una experiencia más completa a cada usuario.</p>
                    </div>
                    <div className="col-12 col-lg-6">
                        <FeatureCard icon="bi-bag-heart" title="Una experiencia integrada">
                            El objetivo de KYNEX es simplificar la búsqueda de suplementos deportivos, entregando información relevante sobre cada producto junto con herramientas y contenidos complementarios.
                        </FeatureCard>
                    </div>
                </div></div>
            </section>

            <FeatureSection id="about-proposal-title" eyebrow="NUESTRA PROPUESTA" title="Más que un catálogo de productos"
                description="KYNEX busca acompañar distintas etapas de la experiencia deportiva, desde la búsqueda de un suplemento hasta la planificación del entrenamiento."
                features={aboutProposal} className="home-section-soft" />
            <FeatureSection id="about-experience-title" eyebrow="EXPERIENCIA KYNEX" title="Una tienda simple, organizada y funcional"
                description="Cada área de KYNEX está diseñada para facilitar la navegación, búsqueda de productos y acceso a información relevante."
                features={aboutExperience} columns={4} />

            <section className="home-section home-section-soft" aria-labelledby="about-categories-title">
                <div className="container">
                    <SectionHeading id="about-categories-title" eyebrow="NUESTRO CATÁLOGO" title="Productos para distintos objetivos"
                        description="La tienda organiza sus productos en distintas categorías para facilitar la elección según las necesidades de cada persona." />
                    <CategoryGrid categories={aboutCategories} />
                </div>
            </section>

            <section className="home-section" aria-labelledby="about-vision-title">
                <div className="container"><div className="about-vision">
                    <SectionHeading id="about-vision-title" eyebrow="NUESTRA VISIÓN" title="Seguir creciendo junto a nuestros usuarios"
                        description="KYNEX busca evolucionar como una tienda especializada capaz de reunir productos, conocimiento y herramientas relacionadas con el rendimiento deportivo." />
                    <p>La propuesta está orientada a ofrecer una experiencia cada vez más personalizada, incorporando nuevas categorías, contenidos y herramientas que permitan acompañar a cada persona en sus objetivos.</p>
                    <Link className="btn btn-outline-light" to="/productos">Explorar catálogo<i className="bi bi-arrow-right ms-2" aria-hidden="true" /></Link>
                </div></div>
            </section>

            <FeatureSection id="about-commitments-title" eyebrow="NUESTRO COMPROMISO" title="Una mejor experiencia de compra"
                description="KYNEX busca entregar una experiencia basada en información clara, navegación sencilla y organización de productos."
                features={aboutCommitments} columns={4} className="home-section-soft" />

            <section className="home-section" aria-labelledby="about-cta-title">
                <div className="container"><div className="home-cta">
                    <div><p className="kynex-eyebrow">DESCUBRE KYNEX</p><h2 id="about-cta-title">Encuentra el producto que necesitas</h2>
                        <p>Explora nuestro catálogo y descubre suplementos organizados según diferentes necesidades y objetivos deportivos.</p>
                    </div>
                    <Link className="btn home-primary-link" to="/productos">Ir a la tienda<i className="bi bi-arrow-right ms-2" aria-hidden="true" /></Link>
                </div></div>
            </section>
        </>
    );
}

export default AboutPage;
