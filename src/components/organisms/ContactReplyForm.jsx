import { useRef, useState } from "react";
import FormField from "../molecules/FormField.jsx";
import Button from "../atoms/Button.jsx";

/** Publica una respuesta explícita; nunca toma el contenido de la nota interna. */
export default function ContactReplyForm({ onSubmit, disabled = false }) {
    const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
    const input = useRef(null); const sending = useRef(false); const attempt = useRef(null);
    async function submit(event) {
        event.preventDefault(); if (sending.current || disabled) return;
        if (!text.trim()) { setError("Escribe la respuesta para el usuario."); input.current?.focus(); return; }
        if (attempt.current?.text !== text) attempt.current = { text, key: crypto.randomUUID() };
        sending.current = true; setBusy(true); setError("");
        try {
            const result = await onSubmit(text, attempt.current.key);
            if (result.success) { setText(""); attempt.current = null; } else setError(result.message);
        } catch { setError("No fue posible confirmar la respuesta. Inténtalo nuevamente."); }
        finally { sending.current = false; setBusy(false); }
    }
    return <form className="auth-form" aria-label="Respuesta para el usuario" aria-busy={busy} noValidate onSubmit={submit}>
        <FormField label="Respuesta para el usuario" as="textarea" rows={6} value={text} maxLength={2000} inputRef={input}
            disabled={busy} helpText={`${text.length} / 2000 caracteres. Se publicará en Mis consultas del remitente.`}
            onChange={event => { setText(event.target.value); setError(""); }} />
        {error && <p role="alert" className="auth-form-alert">{error}</p>}
        <Button type="submit" disabled={busy || disabled}>{busy ? "Enviando respuesta…" : "Enviar respuesta"}</Button>
    </form>;
}
