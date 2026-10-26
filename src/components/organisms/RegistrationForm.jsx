import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../atoms/Button.jsx";
import FormField from "../molecules/FormField.jsx";
import { regions } from "../../data/regions.js";
import { getRegistrationErrors, normalizeRegistration } from "../../utils/registration.js";

const initialValues = { run: "", firstName: "", lastName: "", email: "", birthDate: "", region: "", commune: "", address: "" };
const failureMessage = "No fue posible crear la cuenta. Inténtalo nuevamente.";

function RegistrationForm({ onSubmit, loginState }) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusField, setFocusField] = useState(null);
    const fields = useRef({});
    const communes = regions.find(region => region.name === values.region)?.communes ?? [];

    useEffect(() => {
        if (focusField && !isSubmitting) {
            fields.current[focusField]?.focus();
            setFocusField(null);
        }
    }, [focusField, isSubmitting]);

    function handleChange(event) {
        const { name, value } = event.target;
        const next = { ...values, [name]: value, ...(name === "region" ? { commune: "" } : {}) };
        setValues(next);
        setStatus(null);
        const nextErrors = getRegistrationErrors(next);
        setErrors(current => ({
            ...current,
            ...(current[name] ? { [name]: nextErrors[name] } : {}),
            ...(name === "region" ? { commune: current.commune ? nextErrors.commune : "" } : {})
        }));
    }

    function handleBlur(event) {
        const { name } = event.target;
        setErrors(current => ({ ...current, [name]: getRegistrationErrors(values)[name] }));
    }

    function showErrors(nextErrors) {
        setErrors(nextErrors);
        setFocusField(Object.keys(initialValues).find(name => nextErrors[name]));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (isSubmitting) return;
        const nextErrors = getRegistrationErrors(values);
        if (Object.values(nextErrors).some(Boolean)) {
            showErrors(nextErrors);
            setStatus({ success: false, message: "Revisa los campos marcados antes de continuar." });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);
        try {
            const result = await onSubmit(normalizeRegistration(values));
            if (result?.success) {
                setValues(initialValues);
                setErrors({});
                setStatus({ success: true, message: "Usuario registrado correctamente. Para esta demostración, la contraseña inicial es 1234." });
            } else {
                if (result?.errors) showErrors(result.errors);
                setStatus({ success: false, message: result?.message || failureMessage });
            }
        } catch {
            setStatus({ success: false, message: failureMessage });
        } finally {
            setIsSubmitting(false);
        }
    }

    function fieldProps(name) {
        return {
            name,
            value: values[name],
            error: errors[name],
            onChange: handleChange,
            onBlur: handleBlur,
            inputRef: element => { fields.current[name] = element; },
            disabled: isSubmitting,
            required: name !== "birthDate"
        };
    }

    return (
        <form className="auth-form" aria-label="Formulario de registro" aria-busy={isSubmitting} noValidate onSubmit={handleSubmit}>
            <div className="auth-registration-grid">
                <FormField {...fieldProps("run")} label="RUN" autoComplete="off" maxLength={12}
                    placeholder="123456785" helpText="Entre 7 y 9 caracteres sin formato. También puedes pegarlo con puntos y guion." />
                <FormField {...fieldProps("firstName")} label="Nombre" autoComplete="given-name" maxLength={50} />
                <FormField {...fieldProps("lastName")} label="Apellidos" autoComplete="family-name" maxLength={100} fieldClassName="auth-field-wide" />
                <FormField {...fieldProps("email")} label="Correo electrónico" type="email" autoComplete="email" maxLength={100}
                    helpText="Se permiten cuentas @duoc.cl, @profesor.duoc.cl y @gmail.com." fieldClassName="auth-field-wide" />
                <FormField {...fieldProps("birthDate")} label="Fecha de nacimiento" type="date" autoComplete="bday" helpText="Opcional." />
                <FormField {...fieldProps("region")} label="Región" as="select" autoComplete="address-level1">
                    <option value="">Selecciona una región</option>
                    {regions.map(region => <option key={region.name} value={region.name}>{region.name}</option>)}
                </FormField>
                <FormField {...fieldProps("commune")} label="Comuna" as="select" autoComplete="address-level2" disabled={isSubmitting || !values.region}>
                    <option value="">{values.region ? "Selecciona una comuna" : "Selecciona primero una región"}</option>
                    {communes.map(commune => <option key={commune} value={commune}>{commune}</option>)}
                </FormField>
                <FormField {...fieldProps("address")} label="Dirección" as="textarea" rows={3} autoComplete="street-address" maxLength={300} fieldClassName="auth-field-wide" />
            </div>
            {status && (
                <div className={`auth-form-alert ${status.success ? "auth-form-success" : ""}`} role={status.success ? "status" : "alert"}>
                    <p>{status.message}</p>
                    {status.success && <Link to="/login" state={loginState}>Iniciar sesión con mi cuenta</Link>}
                </div>
            )}
            <div className="auth-form-actions">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creando cuenta…" : "Crear cuenta"}</Button>
                <Link className="btn btn-outline-light" to="/login" state={loginState}>Ya tengo una cuenta</Link>
            </div>
        </form>
    );
}

export default RegistrationForm;
