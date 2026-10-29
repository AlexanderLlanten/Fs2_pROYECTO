/*
 * Organismo de interfaz.
 * Calcula y presenta un resumen del catálogo, incluidas referencias, unidades y productos con stock
 * crítico.
 */

import AdminSummaryCard from "../molecules/AdminSummaryCard.jsx";
import { isCriticalStock } from "../../utils/products.js";

function InventorySummary({ products }) {
    // reduce suma existencias y filter cuenta los productos bajo su umbral; las tarjetas reciben las
    // cifras ya calculadas.
    const units = products.reduce((total, product) => total + product.stock, 0);
    const lowStock = products.filter(isCriticalStock).length;

    return (
        <section aria-labelledby="inventory-summary-title">
            <p className="kynex-eyebrow">CATÁLOGO KYNEX</p>
            <h2 id="inventory-summary-title">Resumen de inventario</h2>
            <div className="row g-3 mt-1">
                <div className="col-sm-6 col-xl-4"><AdminSummaryCard label="Productos en catálogo" value={products.length} icon="bi-box-seam" /></div>
                <div className="col-sm-6 col-xl-4"><AdminSummaryCard label="Unidades en stock" value={units} icon="bi-stack" /></div>
                <div className="col-sm-6 col-xl-4"><AdminSummaryCard label="Productos con stock bajo" value={lowStock} icon="bi-exclamation-triangle" /></div>
            </div>
        </section>
    );
}

export default InventorySummary;
