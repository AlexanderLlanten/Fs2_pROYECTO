import { useState } from "react";
import { productImageSource } from "../../utils/products.js";

function ProductImage({ product }) {
    const source = productImageSource(product.image);
    const [failed, setFailed] = useState(null);
    return source && failed !== source
        ? <img className="kynex-product-image" src={source} alt={product.name} loading="lazy" onError={() => setFailed(source)} />
        : <i className={`bi ${product.icon || "bi-box-seam"}`} aria-hidden="true" />;
}

export default ProductImage;
