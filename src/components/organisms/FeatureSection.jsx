import FeatureCard from "../molecules/FeatureCard.jsx";
import SectionHeading from "../molecules/SectionHeading.jsx";

function FeatureSection({ id, eyebrow, title, description, features, columns = 3, className = "" }) {
    return (
        <section className={`home-section ${className}`.trim()} aria-labelledby={id}>
            <div className="container">
                <SectionHeading id={id} eyebrow={eyebrow} title={title} description={description} />
                <div className="row g-4">
                    {features.map(feature => (
                        <div className={`col-12 col-md-6 ${columns === 4 ? "col-lg-3" : "col-lg-4"}`} key={feature.title}>
                            <FeatureCard icon={feature.icon} title={feature.title} action={feature.action}>{feature.description}</FeatureCard>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeatureSection;
