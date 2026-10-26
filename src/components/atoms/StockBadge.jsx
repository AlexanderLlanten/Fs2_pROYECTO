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
        numericCriticalStock > 0
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
