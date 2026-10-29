/*
 * Organismo de interfaz.
 * Administra la edición de identidad y rol. Reutiliza los campos de perfil, valida y comunica los
 * datos; el servicio comprueba permisos y consistencia antes de guardar.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../atoms/Button.jsx";
import FormField from "../molecules/FormField.jsx";
import UserProfileFields from "./UserProfileFields.jsx";
import { AUTH_ROLES } from "../../data/roles.js";
import { getManagedUserErrors, normalizeManagedUser } from "../../utils/adminUsers.js";

function AdminUserForm({ initialUser, currentUserId, onSubmit, disabled = false }) {
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [values, setValues] = useState(() => ({ ...normalizeManagedUser(initialUser), birthDate: initialUser?.birthDate ?? "", role: initialUser?.role ?? "Cliente" }));
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusField, setFocusField] = useState(null);
    const fields = useRef({});
    const isEditing = Boolean(initialUser);
    const isDisabled = disabled || isSubmitting;

    // Después de mostrar los errores y habilitar los controles se enfoca el primer campo inválido
    // para facilitar su corrección.
    useEffect(() => {
        if (focusField && !isDisabled) { fields.current[focusField]?.focus(); setFocusField(null); }
    }, [focusField, isDisabled]);

    // Actualiza el campo editado del formulario y vuelve a comprobar sus errores cuando corresponde.
    function handleChange(event) {
        const { name, value } = event.target;
        // El spread conserva los campos anteriores y [name] reemplaza el editado; el cambio de región
        // reinicia la comuna.
        const next = { ...values, [name]: value, ...(name === "region" ? { commune: "" } : {}) };
        setValues(next);
        setMessage("");
        const nextErrors = getManagedUserErrors(next);
        setErrors(current => ({ ...current, ...(current[name] ? { [name]: nextErrors[name] } : {}),
            ...(name === "region" ? { commune: current.commune ? nextErrors.commune : "" } : {}) }));
    }

    // Actualiza errores visibles y selecciona el primer campo que debe recibir foco.
    function showErrors(nextErrors) {
        setErrors(nextErrors);
        setFocusField(Object.keys(values).find(name => nextErrors[name]));
    }

    // Valida el formulario y comunica el resultado de la operación al usuario mediante su estado y
    // mensajes.
    async function handleSubmit(event) {
        // Se evita la recarga nativa del formulario para validar y mostrar el resultado mediante el
        // estado de React.
        event.preventDefault();
        if (isDisabled) return;
        const nextErrors = getManagedUserErrors(values);
        if (Object.values(nextErrors).some(Boolean)) {
            showErrors(nextErrors); setMessage("Revisa los campos marcados antes de guardar el usuario."); return;
        }
        setIsSubmitting(true); setMessage("");
        try {
            const result = await onSubmit(normalizeManagedUser(values));
            if (!result?.success) {
                if (result?.errors) showErrors(result.errors);
                setMessage(result?.message || "No fue posible guardar el usuario. Inténtalo nuevamente.");
            }
        } catch { setMessage("No fue posible guardar el usuario. Inténtalo nuevamente."); }
        finally { setIsSubmitting(false); }
    }

    return (
        <form className="auth-form" aria-label={isEditing ? "Formulario de edición de usuario" : "Formulario de nuevo usuario"}
            aria-busy={isSubmitting} noValidate onSubmit={handleSubmit}>
            <UserProfileFields values={values} errors={errors} disabled={isDisabled} onChange={handleChange}
                onBlur={event => { const { name } = event.target; setErrors(current => ({ ...current, [name]: getManagedUserErrors(values)[name] })); }} inputRefs={fields}>
                <FormField label="Tipo de usuario" name="role" as="select" required value={values.role} error={errors.role}
                    disabled={isDisabled} onChange={handleChange} inputRef={element => { fields.current.role = element; }}>
                    {AUTH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </FormField>
            </UserProfileFields>
            {initialUser?.id === currentUserId && values.role !== "Administrador" && (
                <p className="auth-form-alert" role="status">Al cambiar tu propio perfil perderás el acceso a la gestión de usuarios.</p>
            )}
            <p className="auth-field-help">{isEditing ? "La contraseña actual se conserva al guardar." : "La contraseña inicial de esta cuenta de demostración será 1234."}</p>
            {message && <p className="auth-form-alert" role="alert">{message}</p>}
            <div className="auth-form-actions">
                <Button type="submit" disabled={isDisabled}>{isSubmitting ? "Guardando…" : "Guardar usuario"}</Button>
                <Link className="btn btn-outline-light" to="/admin/usuarios">Volver a usuarios</Link>
            </div>
        </form>
    );
}

export default AdminUserForm;
