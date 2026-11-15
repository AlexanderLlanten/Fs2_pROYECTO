/*
 * Organismo de interfaz.
 * Mantiene nombre, correo y comentario. Valida al salir de campos y al enviar, enfoca errores y
 * confirma localmente o delega el envío al servicio indicado por la página.
 */

import { useEffect, useRef, useState } from "react";
import Button from "../atoms/Button.jsx";
import FormField from "../molecules/FormField.jsx";
import { getContactErrors } from "../../utils/contact.js";

const initialValues = { name: "", email: "", comment: "" };

function ContactForm({ onSubmit, identity, pendingSession = false }) {
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [values, setValues] = useState(() => ({ ...initialValues, ...identity }));
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [focusField, setFocusField] = useState(null);
    const inputs = useRef({});
    const submission = useRef(null);
    const sending = useRef(false);
    const [busy, setBusy] = useState(false);
    const remote = typeof onSubmit === "function";
    const received = remote && status?.success;
    const validate = next => ({ ...getContactErrors(next), ...(identity ? { name: "", email: "" } : {}) });

    // Después de mostrar los errores y habilitar los controles se enfoca el primer campo inválido
    // para facilitar su corrección.
    useEffect(() => {
        if (focusField) { inputs.current[focusField]?.focus(); setFocusField(null); }
    }, [focusField]);

    // Actualiza el campo editado del formulario y vuelve a comprobar sus errores cuando corresponde.
    function handleChange(event) {
        const { name, value } = event.target;
        const next = { ...values, [name]: value };
        setValues(next); setStatus(null);
        setErrors(current => ({ ...current, ...((name === "comment" || current[name]) ? { [name]: validate(next)[name] } : {}) }));
    }

    // Valida el formulario y comunica el resultado de la operación al usuario mediante su estado y
    // mensajes.
    async function handleSubmit(event) {
        // Se evita la recarga nativa del formulario para validar y mostrar el resultado mediante el
        // estado de React.
        event.preventDefault();
        if (sending.current || received || pendingSession) return;
        const next = validate(values);
        setErrors(next);
        const invalidField = Object.keys(initialValues).find(name => next[name]);
        if (invalidField) {
            setFocusField(invalidField);
            setStatus({ success: false, message: "Revisa los campos marcados antes de validar." });
            return;
        }
        if (!remote) { setStatus({ success: true, message: "Mensaje validado correctamente." }); return; }
        // Un reintento del mismo contenido reutiliza la referencia, incluso después de un fallo de red.
        const fingerprint = JSON.stringify(values);
        if (submission.current?.fingerprint !== fingerprint) submission.current = { fingerprint, key: crypto.randomUUID() };
        sending.current = true; setBusy(true); setStatus(null);
        try {
            const result = await onSubmit(values, submission.current.key);
            setErrors(result.errors || {});
            setStatus({ success: result.success, message: result.success
                ? `Solicitud recibida. Referencia: ${result.receipt.reference}.` : result.message });
            if (!result.success) setFocusField(Object.keys(initialValues).find(name => result.errors?.[name]) || null);
        } catch { setStatus({ success: false, message: "No fue posible confirmar la recepción. Inténtalo nuevamente." }); }
        finally { sending.current = false; setBusy(false); }
    }

    // Construye propiedades de un campo a partir de su nombre, como valor, error, eventos y
    // referencia.
    function fieldProps(name) {
        return { name, value: identity?.[name] ?? values[name], error: errors[name], required: true, disabled: busy || received,
            readOnly: Boolean(identity && name !== "comment"),
            onChange: handleChange, onBlur: () => setErrors(current => ({ ...current, [name]: validate(values)[name] })),
            inputRef: element => { inputs.current[name] = element; } };
    }

    return <form className="auth-form" aria-label="Formulario de contacto" aria-busy={busy} noValidate onSubmit={handleSubmit}>
        <FormField {...fieldProps("name")} label="Nombre" maxLength={100} autoComplete="name" />
        <FormField {...fieldProps("email")} label="Correo electrónico" type="email" maxLength={100} autoComplete="email"
            helpText={identity ? "Se utilizará el correo de tu cuenta para vincular la consulta." : "Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."} />
        <FormField {...fieldProps("comment")} label="Comentario" as="textarea" rows={6} maxLength={500}
            helpText={`${values.comment.length} / 500 caracteres`} />
        {status && <p className={`auth-form-alert ${status.success ? "auth-form-success" : ""}`} role={status.success ? "status" : "alert"}>{status.message}</p>}
        <div className="auth-form-actions">{received ? <Button type="button" onClick={() => {
            setValues({ ...initialValues, ...identity }); setErrors({}); setStatus(null); submission.current = null; setFocusField(identity ? "comment" : "name");
        }}>Nuevo mensaje</Button> : <Button type="submit" disabled={busy || pendingSession}>
            <i className="bi bi-check2-circle me-2" aria-hidden="true" />{busy ? "Enviando…" : remote ? "Enviar mensaje" : "Validar mensaje"}
        </Button>}</div>
    </form>;
}

export default ContactForm;
