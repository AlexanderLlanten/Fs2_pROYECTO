import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../molecules/FormField.jsx";
import Button from "../atoms/Button.jsx";
import { getCategoryNameError } from "../../utils/categories.js";

/** Conserva el borrador ante errores; la página decide cuándo recargar una versión en conflicto. */
export default function CategoryForm({ category, onSubmit, disabled = false }) {
    const [name,setName] = useState(category?.name || ""); const [error,setError] = useState("");
    const [message,setMessage] = useState(""); const [busy,setBusy] = useState(false); const field = useRef(null);
    async function submit(event) {
        event.preventDefault(); if (busy || disabled) return;
        const invalid = getCategoryNameError(name); setError(invalid); setMessage("");
        if (invalid) { field.current?.focus(); return; }
        setBusy(true);
        try {
            const result = await onSubmit(name.trim());
            if (!result?.success) { setMessage(result?.message || "No fue posible guardar la categoría."); setError(result?.errors?.name || ""); }
        } catch { setMessage("No fue posible guardar la categoría. Inténtalo nuevamente."); }
        finally { setBusy(false); }
    }
    return <form className="auth-form" noValidate onSubmit={submit} aria-label={category ? "Editar categoría" : "Crear categoría"} aria-busy={busy}>
        <FormField label="Nombre de la categoría" name="name" required maxLength={80} autoComplete="off" value={name} error={error} inputRef={field}
            disabled={busy || disabled} helpText="Nombre único de hasta 80 caracteres."
            onChange={event => { setName(event.target.value); setMessage(""); if (error) setError(getCategoryNameError(event.target.value)); }}
            onBlur={() => setError(getCategoryNameError(name))} />
        {message && <p className="auth-form-alert" role="alert">{message}</p>}
        <div className="auth-form-actions"><Button type="submit" disabled={busy || disabled}>{busy ? "Guardando…" : "Guardar categoría"}</Button>
            <Link className="btn btn-outline-light" to="/admin/categorias">Volver a categorías</Link></div>
    </form>;
}
