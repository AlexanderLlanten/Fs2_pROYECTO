import { useRef, useState } from "react";
import FormField from "../molecules/FormField.jsx";
import Button from "../atoms/Button.jsx";
import { CONTACT_STATUSES } from "../atoms/ContactStatus.jsx";

/** Edita únicamente la atención; el remitente y su consulta original son inmutables. */
export default function ContactAttentionForm({ message, onSubmit, disabled = false }) {
    const [status, setStatus] = useState(message.status);
    const [note, setNote] = useState(message.note);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [noteError, setNoteError] = useState("");
    const input = useRef(null); const sending = useRef(false);
    async function submit(event) {
        event.preventDefault(); if (sending.current || disabled) return;
        if (status === "RESUELTA" && !note.trim()) { setNoteError("Describe la atención antes de resolver la consulta."); input.current?.focus(); return; }
        sending.current = true; setBusy(true); setError(""); setNoteError("");
        try { const result = await onSubmit({ status, note }); if (!result.success) { setError(result.message); setNoteError(result.errors?.note || ""); } }
        catch { setError("No fue posible guardar la atención. Inténtalo nuevamente."); }
        finally { sending.current = false; setBusy(false); }
    }
    return <form className="auth-form" aria-label="Atención de la solicitud" aria-busy={busy} noValidate onSubmit={submit}>
        <FormField label="Estado de atención" as="select" value={status} disabled={busy} onChange={event => { setStatus(event.target.value); setNoteError(""); }}>
            {Object.entries(CONTACT_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </FormField>
        <FormField label="Nota interna" as="textarea" rows={6} maxLength={1000} value={note} error={noteError} inputRef={input}
            helpText={`${note.length} / 1000 caracteres. La nota se conserva en el historial y no se envía al remitente.`}
            disabled={busy} onChange={event => { setNote(event.target.value); setNoteError(""); }} />
        {error && <p className="auth-form-alert" role="alert">{error}</p>}
        <Button type="submit" disabled={busy || disabled}>{busy ? "Guardando…" : "Guardar atención"}</Button>
    </form>;
}
