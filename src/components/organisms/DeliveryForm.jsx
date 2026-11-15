import { useState } from "react";
import FormField from "../molecules/FormField.jsx";
import { regions } from "../../data/regions.js";

export default function DeliveryForm({ user, onSubmit, disabled }) {
    const [values, setValues] = useState({ recipient: `${user.firstName} ${user.lastName}`.trim(), region: user.region || "", commune: user.commune || "", address: user.address || "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const communes = regions.find(region => region.name === values.region)?.communes || [];
    const change = event => { const { name, value } = event.target; setValues(previous => ({ ...previous, [name]: value, ...(name === "region" ? { commune: "" } : {}) })); setError(""); };
    async function submit(event) {
        event.preventDefault(); if (disabled || busy) return;
        const data = Object.fromEntries(Object.entries(values).map(([key,value]) => [key,value.trim()]));
        if (!data.recipient || !data.address || !communes.includes(data.commune)) { setError("Completa el destinatario, la dirección y una región y comuna relacionadas."); return; }
        setBusy(true); setError("");
        try { await onSubmit(data); } catch (error) { setError(error.message); } finally { setBusy(false); }
    }
    return <form className="auth-form" onSubmit={submit} aria-label="Dirección de entrega" aria-busy={busy}>
        <FormField label="Destinatario" name="recipient" required maxLength={150} value={values.recipient} onChange={change} disabled={busy} />
        <FormField label="Región" name="region" as="select" required value={values.region} onChange={change} disabled={busy}>
            <option value="">Selecciona una región</option>{regions.map(region => <option key={region.name}>{region.name}</option>)}
        </FormField>
        <FormField label="Comuna" name="commune" as="select" required value={values.commune} onChange={change} disabled={busy || !values.region}>
            <option value="">Selecciona una comuna</option>{communes.map(commune => <option key={commune}>{commune}</option>)}
        </FormField>
        <FormField label="Dirección" name="address" as="textarea" required maxLength={300} value={values.address} onChange={change} disabled={busy} />
        {error && <p className="auth-form-alert" role="alert">{error}</p>}
        <button className="btn btn-success" type="submit" disabled={busy || disabled}>{busy ? "Creando pedido…" : "Crear pedido y revisar pago"}</button>
    </form>;
}
