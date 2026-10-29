// Muestra una cantidad y los controles para aumentarla o disminuirla.

function QuantitySelector({
    quantity,
    onIncrease,
    onDecrease,
    disabledIncrease = false,
    disabledDecrease = false,
    label = "Cantidad"
}) {
    return (
        <div className="quantity-selector">
            <span className="quantity-selector-label">
                {label}
            </span>

            <div
                className="quantity-selector-control"
                role="group"
                aria-label={label}
            >
                <button
                    type="button"
                    aria-label="Disminuir cantidad"
                    disabled={disabledDecrease}
                    onClick={onDecrease}
                >
                    <i
                        className="bi bi-dash"
                        aria-hidden="true"
                    />
                </button>

                <output
                    aria-label="Cantidad actual"
                >
                    {quantity}
                </output>

                <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    disabled={disabledIncrease}
                    onClick={onIncrease}
                >
                    <i
                        className="bi bi-plus"
                        aria-hidden="true"
                    />
                </button>
            </div>
        </div>
    );
}

export default QuantitySelector;
