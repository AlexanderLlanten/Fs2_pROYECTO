import RoutineBuilder from "../components/organisms/RoutineBuilder.jsx";

function RoutinePage() {
    return <>
        <section className="auth-page-header"><div className="container"><p className="kynex-eyebrow">KYNEX TRAINING</p><h1>Mi rutina</h1>
            <p>Organiza tus ejercicios, series y repeticiones. La información se guarda localmente en tu navegador.</p>
        </div></section>
        <section className="training-section" aria-label="Editor de mi rutina"><div className="container"><RoutineBuilder /></div></section>
    </>;
}

export default RoutinePage;
