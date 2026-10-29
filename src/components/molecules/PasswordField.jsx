/*
 * Molécula reutilizable.
 * Reutiliza FormField y conserva el estado que alterna entre contraseña oculta y visible. Recibe las
 * demás propiedades del formulario.
 */

import { useId, useState } from "react";

import FormField from "./FormField.jsx";

function PasswordField({ id, disabled, autoComplete = "current-password", ...props }) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    // Este estado controla si la contraseña se presenta como texto o como un campo oculto; no
    // modifica su valor.
    const [isVisible, setIsVisible] = useState(false);

    return (
        <FormField
            {...props}
            id={fieldId}
            type={isVisible ? "text" : "password"}
            className="auth-password-input"
            autoComplete={autoComplete}
            disabled={disabled}
        >
            <button
                className="auth-password-toggle"
                type="button"
                aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-controls={fieldId}
                aria-pressed={isVisible}
                disabled={disabled}
                onClick={() => setIsVisible(current => !current)}
            >
                <i className={`bi ${isVisible ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
            </button>
        </FormField>
    );
}

export default PasswordField;
