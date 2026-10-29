/*
 * Molécula reutilizable.
 * Presenta una lista de información ampliada del producto con título y un mensaje cuando no hay datos
 * válidos.
 */

import { useId } from "react";
import { productList } from "../../utils/productDetails.js";

function ProductInfoList({ title, items, emptyText = "No especificado" }) {
    const titleId = useId();
    const values = productList(items);
    return <section className="product-info-panel" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        {values.length ? <ul>{values.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul> : <p>{emptyText}</p>}
    </section>;
}

export default ProductInfoList;
