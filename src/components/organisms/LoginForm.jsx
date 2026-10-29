/*
 * Organismo de interfaz.
 * Mantiene correo, contraseña, errores y envío en curso. Valida campos, evita envíos repetidos y
 * muestra el resultado del callback de autenticación.
 */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../atoms/Button.jsx";
import FormField from "../molecules/FormField.jsx";
import PasswordField from "../molecules/PasswordField.jsx";
import { getEmailError, getPasswordError } from "../../utils/validation.js";

const validators = { email: getEmailError, password: getPasswordError };

function LoginForm({ onSubmit }) {
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    // Actualiza el campo editado del formulario y vuelve a comprobar sus errores cuando corresponde.
    function handleChange(event) {
        const { name, value } = event.target;
        setValues(current => ({ ...current, [name]: value }));
        setMessage("");

        if (errors[name]) {
            setErrors(current => ({ ...current, [name]: validators[name](value) }));
        }
    }

    // Manejador local que comprueba el campo cuando pierde el foco.
    function handleBlur(event) {
        const { name, value } = event.target;
        setErrors(current => ({ ...current, [name]: validators[name](value) }));
    }

    // Valida el formulario y comunica el resultado de la operación al usuario mediante su estado y
    // mensajes.
    async function handleSubmit(event) {
        // Se evita la recarga nativa del formulario para validar y mostrar el resultado mediante el
        // estado de React.
        event.preventDefault();
        if (isSubmitting) {
            return;
        }

        const nextErrors = {
            email: getEmailError(values.email),
            password: getPasswordError(values.password)
        };
        setErrors(nextErrors);
        setMessage("");

        if (nextErrors.email || nextErrors.password) {
            setMessage("Revisa los campos marcados antes de continuar.");
            (nextErrors.email ? emailRef : passwordRef).current?.focus();
            return;
        }

        setIsSubmitting(true);

        try {
            // El correo se normaliza antes de autenticar. El resultado fallido se muestra aquí; la
            // sesión exitosa la actualiza el contexto.
            const result = await onSubmit(values.email.trim().toLowerCase(), values.password);
            if (!result?.success) {
                setMessage(result?.message || "No fue posible iniciar sesión. Inténtalo nuevamente.");
            }
        } catch {
            setMessage("No fue posible iniciar sesión. Inténtalo nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            className="auth-form"
            aria-label="Formulario de inicio de sesión"
            aria-busy={isSubmitting}
            noValidate
            onSubmit={handleSubmit}
        >
            <FormField
                label="Correo electrónico"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@gmail.com"
                maxLength={100}
                required
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                inputRef={emailRef}
                error={errors.email}
                helpText="Se permiten cuentas @duoc.cl, @profesor.duoc.cl y @gmail.com."
                disabled={isSubmitting}
            />
            <PasswordField
                label="Contraseña"
                name="password"
                minLength={4}
                maxLength={10}
                required
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                inputRef={passwordRef}
                error={errors.password}
                helpText="Entre 4 y 10 caracteres."
                disabled={isSubmitting}
            />
            {message && <p className="auth-form-alert" role="alert">{message}</p>}
            <div className="auth-form-actions">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
                </Button>
                <Link className="btn btn-outline-light" to="/productos">Volver a la tienda</Link>
            </div>
        </form>
    );
}

export default LoginForm;
