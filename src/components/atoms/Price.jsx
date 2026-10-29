/*
 * Átomo reutilizable.
 * Formatea números como pesos chilenos mediante Intl.NumberFormat y presenta una etiqueta opcional.
 * El formato monetario no modifica el importe usado en los cálculos.
 */

// Convierte un importe a su representación monetaria chilena para presentación.
function formatPrice(value) {
    return new Intl.NumberFormat(
        "es-CL",
        {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }
    ).format(
        Number(value) || 0
    );
}

function Price({
    value,
    label = "Precio"
}) {
    return (
        <div className="kynex-price">
            <small>
                {label}
            </small>

            <strong>
                {formatPrice(value)}
            </strong>
        </div>
    );
}

export {
    formatPrice
};

export default Price;
