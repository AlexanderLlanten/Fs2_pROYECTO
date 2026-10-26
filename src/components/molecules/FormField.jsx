import { useId } from "react";

function FormField({ id, label, error = "", helpText, inputRef, children, className = "", ...inputProps }) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const describedBy = [
        helpText ? `${fieldId}-help` : null,
        error ? `${fieldId}-error` : null,
        inputProps["aria-describedby"]
    ].filter(Boolean).join(" ") || undefined;

    return (
        <div className="auth-field">
            <label htmlFor={fieldId}>
                {label}
                {inputProps.required && <span className="auth-required" aria-hidden="true"> *</span>}
            </label>
            <div className="auth-input-group">
                <input
                    {...inputProps}
                    id={fieldId}
                    ref={inputRef}
                    className={`auth-input ${error ? "auth-input-invalid" : ""} ${className}`.trim()}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                />
                {children}
            </div>
            {helpText && <p className="auth-field-help" id={`${fieldId}-help`}>{helpText}</p>}
            {error && <p className="auth-field-error" id={`${fieldId}-error`}>{error}</p>}
        </div>
    );
}

export default FormField;
