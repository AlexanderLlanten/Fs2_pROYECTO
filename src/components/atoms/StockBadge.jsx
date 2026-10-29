/*
 * Átomo reutilizable.
 * Clasifica disponibilidad y stock crítico. La ausencia de stock tiene prioridad sobre la alerta por
 * pocas unidades y se expresa con texto y estilo.
 */

// Deriva el estado visual de disponibilidad, priorizando sin stock frente a la advertencia crítica.
function getStockStatus(
    stock,
    criticalStock
) {
    const numericStock =
        Number(stock) || 0;

    const numericCriticalStock =
        Number(criticalStock) || 0;

    if (numericStock <= 0) {
        return {
            label: "Sin stock",
            modifier: "danger"
        };
    }

    if (
        criticalStock !== null && criticalStock !== undefined
        &&
        numericStock <= numericCriticalStock
    ) {
        return {
            label: "Stock crítico",
            modifier: "warning"
        };
    }

    return {
        label: "Disponible",
        modifier: "success"
    };
}

function StockBadge({
    stock,
    criticalStock
}) {
    const status =
        getStockStatus(
            stock,
            criticalStock
        );

    return (
        <span
            className={`kynex-stock-badge kynex-stock-badge--${status.modifier}`}
        >
            {status.label}
        </span>
    );
}

export {
    getStockStatus
};

export default StockBadge;
