import { Link } from "react-router-dom";
import SectionHeading from "../molecules/SectionHeading.jsx";

function GoalSection({ goals }) {
    return (
        <section className="home-section" aria-labelledby="goals-title">
            <div className="container">
                <SectionHeading id="goals-title" eyebrow="TUS OBJETIVOS"
                    title="¿Qué quieres conseguir?"
                    description="Explora el catálogo KYNEX y conoce las opciones para acompañar tu entrenamiento." />
                <div className="row g-4">
                    {goals.map(goal => <div className="col-12 col-sm-6 col-lg-3" key={goal.name}>
                        <Link className="home-goal-card" to="/productos">
                            <i className={`bi ${goal.icon}`} aria-hidden="true" />
                            <span>{goal.name}</span>
                            <i className="bi bi-arrow-up-right" aria-hidden="true" />
                        </Link>
                    </div>)}
                </div>
            </div>
        </section>
    );
}

export default GoalSection;
