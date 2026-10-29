/*
 * Organismo de interfaz.
 * Mantiene nombre, correo y comentario. Valida al salir de campos y al enviar, enfoca errores y
 * confirma localmente; no envía ni almacena mensajes.
 */

import { useEffect, useRef, useState } from "react";
import Button from "../atoms/Button.jsx";
import FormField from "../molecules/FormField.jsx";
import { getContactErrors } from "../../utils/contact.js";

const initialValues = { name: "", email: "", comment: "" };

function ContactForm() {
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [focusField, setFocusField] = useState(null);
    const inputs = useRef({});

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
        setErrors(current => ({ ...current, ...((name === "comment" || current[name]) ? { [name]: getContactErrors(next)[name] } : {}) }));
    }

    // Valida el formulario y comunica el resultado de la operación al usuario mediante su estado y
    // mensajes.
    function handleSubmit(event) {
        // Se evita la recarga nativa del formulario para validar y mostrar el resultado mediante el
        // estado de React.
        event.preventDefault();
        const next = getContactErrors(values);
        setErrors(next);
        const invalidField = Object.keys(initialValues).find(name => next[name]);
        if (invalidField) {
            setFocusField(invalidField);
            setStatus({ success: false, message: "Revisa los campos marcados antes de validar." });
            return;
        }
        // La confirmación acredita solo las validaciones locales; esta operación no envía correos ni
        // guarda mensajes.
        setStatus({ success: true, message: "Mensaje validado correctamente." });
    }

    // Construye propiedades de un campo a partir de su nombre, como valor, error, eventos y
    // referencia.
    function fieldProps(name) {
        return { name, value: values[name], error: errors[name], required: true,
            onChange: handleChange, onBlur: () => setErrors(current => ({ ...current, [name]: getContactErrors(values)[name] })),
            inputRef: element => { inputs.current[name] = element; } };
    }

    return <form className="auth-form" aria-label="Formulario de contacto" noValidate onSubmit={handleSubmit}>
        <FormField {...fieldProps("name")} label="Nombre" maxLength={100} autoComplete="name" />
        <FormField {...fieldProps("email")} label="Correo electrónico" type="email" maxLength={100} autoComplete="email"
            helpText="Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com." />
        <FormField {...fieldProps("comment")} label="Comentario" as="textarea" rows={6} maxLength={500}
            helpText={`${values.comment.length} / 500 caracteres`} />
        {status && <p className={`auth-form-alert ${status.success ? "auth-form-success" : ""}`} role={status.success ? "status" : "alert"}>{status.message}</p>}
        <div className="auth-form-actions"><Button type="submit"><i className="bi bi-check2-circle me-2" aria-hidden="true" />Validar mensaje</Button></div>
    </form>;
}

export default ContactForm;
