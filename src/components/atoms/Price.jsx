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
