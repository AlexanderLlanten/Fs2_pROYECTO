import { useRef, useState } from "react";
import FormField from "../molecules/FormField.jsx";
import Button from "../atoms/Button.jsx";

export default function ContactClaimForm({ onSubmit }) {
    const [reference, setReference] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
    const input = useRef(null); const sending = useRef(false);
    async function submit(event) {
        event.preventDefault(); if (sending.current) return;
        if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(reference.trim())) { setError("Ingresa la referencia completa que recibiste al enviar tu consulta."); input.current?.focus(); return; }
        sending.current = true; setBusy(true); setError("");
        try { const result = await onSubmit(reference); if (!result.success) setError(result.message); }
        catch { setError("No fue posible vincular la consulta. Inténtalo nuevamente."); }
        finally { sending.current = false; setBusy(false); }
    }
    return <form className="auth-form" aria-label="Vincular consulta anterior" noValidate onSubmit={submit}>
        <FormField label="Referencia de recepción" value={reference} maxLength={36} inputRef={input} error={error} disabled={busy}
            onChange={event => { setReference(event.target.value); setError(""); }} autoComplete="off" />
        <Button type="submit" disabled={busy}>{busy ? "Vinculando…" : "Vincular consulta"}</Button>
    </form>;
}
