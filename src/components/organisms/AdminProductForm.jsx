/*
 * Organismo de interfaz.
 * Administra los campos de alta y edición de producto. Mantiene valores, errores, mensaje y bloqueo;
 * valida, enfoca el primer error y entrega datos al callback de guardado.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../molecules/FormField.jsx";
import Button from "../atoms/Button.jsx";
import { getProductErrors, isCriticalStock, normalizeProduct, PRODUCT_CATEGORIES } from "../../utils/products.js";

const fieldNames = ["code", "category", "name", "description", "price", "stock", "criticalStock", "image"];
// Convierte los campos editables del producto a texto, que es el formato que manejan los controles
// del formulario.
function initialValues(product) {
    return Object.fromEntries(fieldNames.map(name => [name, String(product?.[name] ?? "")]));
}

function AdminProductForm({ initialProduct, onSubmit, disabled = false }) {
    // useState conserva datos de la interfaz entre renderizados; la segunda posición de cada par es
    // la función que solicita su actualización.
    const [values, setValues] = useState(() => initialValues(initialProduct));
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [focusField, setFocusField] = useState(null);
    const inputs = useRef({});
    const isDisabled = disabled || busy;
    // Después de mostrar los errores y habilitar los controles se enfoca el primer campo inválido
    // para facilitar su corrección.
    useEffect(() => {
        if (focusField && !isDisabled) { inputs.current[focusField]?.focus(); setFocusField(null); }
    }, [focusField, isDisabled]);

    // Actualiza el campo editado del formulario y vuelve a comprobar sus errores cuando corresponde.
    function handleChange(event) {
        const { name, value } = event.target;
        const next = { ...values, [name]: value };
        setValues(next); setMessage("");
        setErrors(current => ({ ...current, ...(current[name] ? { [name]: getProductErrors(next)[name] } : {}) }));
    }
    // Actualiza errores visibles y selecciona el primer campo que debe recibir foco.
    function showErrors(next) { setErrors(next); setFocusField(fieldNames.find(name => next[name])); }
    // Valida el formulario y comunica el resultado de la operación al usuario mediante su estado y
    // mensajes.
    async function handleSubmit(event) {
        // Se evita la recarga nativa del formulario para validar y mostrar el resultado mediante el
        // estado de React.
        event.preventDefault();
        if (isDisabled) return;
        const next = getProductErrors(values);
        if (Object.keys(next).length) { showErrors(next); setMessage("Revisa los campos marcados antes de guardar el producto."); return; }
        setBusy(true); setMessage("");
        try {
            const result = await onSubmit(normalizeProduct(values));
            if (!result?.success) {
                if (result?.errors) showErrors(result.errors);
                setMessage(result?.message || "No fue posible guardar el producto. Inténtalo nuevamente.");
            }
        } catch { setMessage("No fue posible guardar el producto. Inténtalo nuevamente."); }
        finally { setBusy(false); }
    }
    // Agrupa valor, error, eventos y referencia del campo solicitado para reutilizarlos en los
    // controles.
    function props(name) {
        return { name, value: values[name], error: errors[name], disabled: isDisabled, onChange: handleChange,
            onBlur: () => setErrors(current => ({ ...current, [name]: getProductErrors(values)[name] })),
            inputRef: element => { inputs.current[name] = element; } };
    }
    const data = normalizeProduct(values);
    const critical = Number.isSafeInteger(data.stock) && data.stock >= 0 && Number.isSafeInteger(data.criticalStock) && data.criticalStock >= 0 && isCriticalStock(data);

    return <form className="auth-form" aria-label="Formulario de producto" aria-busy={busy} noValidate onSubmit={handleSubmit}>
        <div className="auth-registration-grid">
            <FormField {...props("code")} label="Código" required minLength={3} autoComplete="off" placeholder="KYN007" helpText="Mínimo 3 caracteres. Debe ser único en el catálogo." />
            <FormField {...props("category")} label="Categoría" as="select" required>
                <option value="">Selecciona una categoría</option>
                {PRODUCT_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
            </FormField>
            <FormField {...props("name")} label="Nombre" required maxLength={100} fieldClassName="auth-field-wide" />
            <FormField {...props("description")} label="Descripción" as="textarea" rows={4} maxLength={500} fieldClassName="auth-field-wide" helpText={`${values.description.length} / 500 caracteres. Opcional.`} />
            <FormField {...props("price")} label="Precio" type="number" required min={0} step="0.01" helpText="Precio en pesos chilenos. Puede ser 0." />
            <FormField {...props("stock")} label="Stock" type="number" required min={0} step={1} />
            <FormField {...props("criticalStock")} label="Stock crítico" type="number" min={0} step={1} helpText="Opcional. Alerta cuando el stock sea igual o inferior." />
            <FormField {...props("image")} label="Imagen" helpText="Opcional. URL http(s) o ruta /assets/. Si falla, se muestra el ícono." />
        </div>
        {critical && <p className="auth-form-alert" role="status">Stock crítico: las unidades disponibles son iguales o inferiores al umbral indicado.</p>}
        {message && <p className="auth-form-alert" role="alert">{message}</p>}
        <div className="auth-form-actions">
            <Button type="submit" disabled={isDisabled}>{busy ? "Guardando…" : "Guardar producto"}</Button>
            <Link className="btn btn-outline-light" to="/admin/productos">Volver a productos</Link>
        </div>
    </form>;
}

export default AdminProductForm;
