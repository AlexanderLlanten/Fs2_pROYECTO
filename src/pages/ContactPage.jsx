/*
 * Página y coordinación de la vista.
 * Presenta el contexto de contacto y el formulario de validación local.
 */

import ContactForm from "../components/organisms/ContactForm.jsx";

const topics = [
    { icon: "bi-envelope", text: "Consultas generales." },
    { icon: "bi-bag", text: "Información de productos." },
    { icon: "bi-question-circle", text: "Soporte y orientación." }
];

function ContactPage() {
    return <>
        <section className="auth-page-header"><div className="container">
            <p className="kynex-eyebrow">CONTACTO</p><h1>Hablemos</h1><p>Cuéntanos tu consulta.</p>
        </div></section>
        <section className="auth-section" aria-labelledby="contact-form-title"><div className="container"><div className="auth-layout">
            <div className="auth-form-panel">
                <h2 id="contact-form-title">Tu mensaje</h2>
                <p className="auth-form-intro">Completa tus datos y valida tu mensaje. Los campos con asterisco son obligatorios.</p>
                <p className="auth-form-intro">Esta demostración valida el formulario; no envía mensajes.</p>
                <ContactForm />
            </div>
            <aside className="auth-side-panel" aria-labelledby="contact-info-title">
                <i className="bi bi-chat-dots auth-side-icon" aria-hidden="true" /><h2 id="contact-info-title">Contacta a KYNEX</h2>
                <p>Un espacio para tus dudas y solicitudes.</p>
                <ul className="list-unstyled d-grid gap-3 mt-4 mb-0">{topics.map(topic => <li className="d-flex align-items-start gap-3" key={topic.icon}>
                    <i className={`bi ${topic.icon} contact-topic-icon`} aria-hidden="true" /><span>{topic.text}</span>
                </li>)}</ul>
            </aside>
        </div></div></section>
    </>;
}

export default ContactPage;
