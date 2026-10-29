/*
 * Átomo reutilizable.
 * Construye un botón reutilizable. Recibe texto o iconos, tipo, variante, clases, estado
 * deshabilitado y función de clic. Traduce la variante a clases Bootstrap.
 */

function Button({
    children,
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
    onClick
}) {
    const bootstrapVariant =
        variant === "secondary"
            ? "btn-outline-light"
            : "btn-success";

    return (
        <button
            type={type}
            className={`btn ${bootstrapVariant} ${className}`.trim()}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default Button;
