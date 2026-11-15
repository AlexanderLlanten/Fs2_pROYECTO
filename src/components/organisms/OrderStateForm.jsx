import { useState } from "react";
import { commerce, nextStates, orderLabels } from "../../services/api/commerce.js";

export default function OrderStateForm({ order, onChange }) {
    const options = nextStates[order.status] || [];
    const [target, setTarget] = useState(""); const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false); const [error, setError] = useState("");
    if (!options.length) return null;
    async function submit(event) {
        event.preventDefault(); if (busy || !options.includes(target) || !reason.trim()) return;
        setBusy(true); setError("");
        try { const result = await commerce.transition(order.id, order.version, target, reason.trim()); onChange(result); setTarget(""); setReason(""); }
        catch (error) { setError(error.message); } finally { setBusy(false); }
    }
    return <form className="auth-form-panel auth-form my-4" onSubmit={submit} aria-label="Cambiar estado del pedido">
        <h2>Gestión del pedido</h2>
        <label htmlFor="order-state">Nuevo estado</label><select className="form-select" id="order-state" required value={target} onChange={event => setTarget(event.target.value)} disabled={busy}>
            <option value="">Selecciona un estado</option>{options.map(value => <option key={value} value={value}>{orderLabels[value]}</option>)}
        </select>
        <label htmlFor="order-reason">Motivo</label><textarea className="form-control" id="order-reason" required maxLength={300} value={reason} onChange={event => setReason(event.target.value)} disabled={busy} />
        {target === "CANCELLED" && <p>La anulación de una compra confirmada restituye su inventario una sola vez y registra una reversión de prueba. No representa un reembolso real.</p>}
        <button className={`btn ${target === "CANCELLED" ? "btn-danger" : "btn-success"}`} disabled={busy || !options.includes(target) || !reason.trim()}>{busy ? "Guardando…" : target === "CANCELLED" ? "Anular pedido" : "Actualizar estado"}</button>
        {error && <p className="auth-form-alert" role="alert">{error}</p>}
    </form>;
}
