export const CONTACT_STATUSES = Object.freeze({ PENDIENTE: "Pendiente", EN_ATENCION: "En atención", RESUELTA: "Resuelta" });

export default function ContactStatus({ status }) {
    return <span className={`contact-status contact-status-${status.toLowerCase()}`}>{CONTACT_STATUSES[status] || status}</span>;
}
