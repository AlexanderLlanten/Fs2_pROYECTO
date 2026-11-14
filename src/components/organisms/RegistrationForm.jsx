/*
 * Organismo de interfaz.
 * Coordina el registro público con campos reutilizables. Conserva valores y errores, cambia comunas
 * al cambiar región y confirma la creación sin abrir sesión automáticamente.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../atoms/Button.jsx";
import UserProfileFields from "./UserProfileFields.jsx";
import { getRegistrationErrors, normalizeRegistration } from "../../utils/registration.js";
import PasswordField from "../molecules/PasswordField.jsx";
import { getApiRegistrationErrors, normalizeApiRegistration } from "../../utils/apiAccount.js";

const initialValues = { run: "", firstName: "", lastName: "", email: "", birthDate: "", region: "", commune: "", address: "" };
const failureMessage = "No fue posible crear la cuenta. Inténtalo nuevamente.";

function RegistrationForm({ onSubmit, loginState, remote = false }) {
    const emptyValues = remote ? { ...initialValues, password: "", passwordConfirmation: "" } : initialValues;
    const validate = remote ? getApiRegistrationErrors : getRegistrationErrors;
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [values, setValues] = useState(emptyValues);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusField, setFocusField] = useState(null);
    const fields = useRef({});

    // Después de mostrar los errores y habilitar los controles se enfoca el primer campo inválido
    // para facilitar su corrección.
    useEffect(() => {
        if (focusField && !isSubmitting) {
            fields.current[focusField]?.focus();
            setFocusField(null);
        }
    }, [focusField, isSubmitting]);

    // Actualiza el campo editado del formulario y vuelve a comprobar sus errores cuando corresponde.
    function handleChange(event) {
        const { name, value } = event.target;
        // [name] actualiza el campo editado; al cambiar región se limpia commune para no conservar
        // una comuna incompatible.
        const next = { ...values, [name]: value, ...(name === "region" ? { commune: "" } : {}) };
        setValues(next);
        setStatus(null);
        const nextErrors = validate(next);
        setErrors(current => ({
            ...current,
            ...(current[name] ? { [name]: nextErrors[name] } : {}),
            ...(name === "region" ? { commune: current.commune ? nextErrors.commune : "" } : {})
        }));
    }

    // Manejador local que comprueba el campo cuando pierde el foco.
    function handleBlur(event) {
        const { name } = event.target;
        setErrors(current => ({ ...current, [name]: validate(values)[name] }));
    }

    // Actualiza errores visibles y selecciona el primer campo que debe recibir foco.
    function showErrors(nextErrors) {
        setErrors(nextErrors);
        setFocusField(Object.keys(emptyValues).find(name => nextErrors[name]));
    }

    // Valida el formulario y comunica el resultado de la operación al usuario mediante su estado y
    // mensajes.
    async function handleSubmit(event) {
        // Se evita la recarga nativa del formulario para validar y mostrar el resultado mediante el
        // estado de React.
        event.preventDefault();
        if (isSubmitting) return;
        const nextErrors = validate(values);
        if (Object.values(nextErrors).some(Boolean)) {
            showErrors(nextErrors);
            setStatus({ success: false, message: "Revisa los campos marcados antes de continuar." });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);
        try {
            // onSubmit conecta el formulario con su página o contexto. await permite esperar su
            // resultado; finally vuelve a habilitar el formulario.
            const result = await onSubmit(remote ? normalizeApiRegistration(values) : normalizeRegistration(values));
            if (result?.success) {
                setValues(emptyValues);
                setErrors({});
                setStatus({ success: true, message: remote ? "Cuenta creada correctamente. Ya puedes iniciar sesión con tu contraseña." : "Usuario registrado correctamente. Para esta demostración, la contraseña inicial es 1234." });
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

    return (
        <form className="auth-form" aria-label="Formulario de registro" aria-busy={isSubmitting} noValidate onSubmit={handleSubmit}>
            <UserProfileFields values={values} errors={errors} disabled={isSubmitting}
                onChange={handleChange} onBlur={handleBlur} inputRefs={fields} remote={remote}>
                {remote && <>
                    <PasswordField label="Contraseña" name="password" autoComplete="new-password" minLength={10} maxLength={72} required
                        value={values.password} error={errors.password} onChange={handleChange} onBlur={handleBlur} disabled={isSubmitting}
                        inputRef={element => { fields.current.password = element; }} helpText="Al menos 10 caracteres. Evita reutilizar contraseñas de otras cuentas." />
                    <PasswordField label="Confirmar contraseña" name="passwordConfirmation" autoComplete="new-password" minLength={10} maxLength={72} required
                        value={values.passwordConfirmation} error={errors.passwordConfirmation} onChange={handleChange} onBlur={handleBlur} disabled={isSubmitting}
                        inputRef={element => { fields.current.passwordConfirmation = element; }} />
                </>}
            </UserProfileFields>
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
