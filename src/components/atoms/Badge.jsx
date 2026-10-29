/*
 * Átomo reutilizable.
 * Envuelve el contenido recibido en una etiqueta visual y permite añadir clases. No decide reglas de
 * negocio.
 */

function Badge({
    children,
    className = ""
}) {
    return (
        <span
            className={`kynex-badge ${className}`.trim()}
        >
            {children}
        </span>
    );
}

export default Badge;
