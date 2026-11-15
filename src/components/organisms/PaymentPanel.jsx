import { useState } from "react";
import useApiResource from "../../hooks/useApiResource.js";
import useCart from "../../hooks/useCart.js";
import { remoteCatalog } from "../../services/api/catalogStore.js";
import { commerce, paymentLabels, scenarioLabels } from "../../services/api/commerce.js";
import ApiResourceState from "../molecules/ApiResourceState.jsx";

export default function PaymentPanel({ order, onChange }) {
    const options = useApiResource("/payment-options"); const { reloadCart } = useCart();
    const [scenario, setScenario] = useState("APPROVE"); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
    const pending = order.payments.find(payment => payment.status === "PENDING");
    async function perform(action) {
        if (busy) return; setBusy(true); setError("");
        try { await action(); } catch (error) { setError(error.message); } finally { setBusy(false); }
    }
    return <section className="auth-form-panel my-4"><h2>Pago de prueba</h2>
        <p><strong>Entorno académico emulado. No se realizan cobros reales ni se solicitan datos bancarios.</strong></p>
        {order.payments.length > 0 && <ul>{order.payments.map(payment => <li key={payment.id}>
            {scenarioLabels[payment.scenario]}: {paymentLabels[payment.status]}{payment.reversed ? ". Reversión de prueba registrada." : ""}
        </li>)}</ul>}
        {options.loading || options.error ? <ApiResourceState resource={options} /> : !options.data.enabled ? <p role="alert">El pago de prueba no está habilitado en este entorno.</p>
            : order.status === "PENDING" && <>
                {pending ? <button className="btn btn-success" disabled={busy} onClick={() => perform(async () => {
                    const updated = await commerce.confirm(order.id, pending.id); onChange(updated);
                    await Promise.all([reloadCart?.(), remoteCatalog.reload()]);
                })}>{busy ? "Procesando…" : "Confirmar pago de prueba"}</button>
                    : <div className="auth-form"><label htmlFor="payment-scenario">Escenario de prueba</label>
                        <select id="payment-scenario" className="form-select" value={scenario} onChange={event => setScenario(event.target.value)} disabled={busy}>
                            {options.data.scenarios.map(value => <option key={value} value={value}>{scenarioLabels[value]}</option>)}
                        </select>
                        <button className="btn btn-success mt-3" disabled={busy} onClick={() => perform(async () => { await commerce.payment(order, scenario); await onChange(); })}>{busy ? "Preparando…" : "Preparar pago de prueba"}</button>
                    </div>}
            </>}
        {error && <p className="auth-form-alert mt-3" role="alert">{error}</p>}
    </section>;
}
