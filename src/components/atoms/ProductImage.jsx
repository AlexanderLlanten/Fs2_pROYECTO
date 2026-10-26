import { useState } from "react";
import { productImageSource } from "../../utils/products.js";
import { productImages } from "../../data/productImages.js";
import { assetImages } from "../../data/assetImages.js";

function ProductImage({ product }) {
    const custom = productImageSource(product.image);
    const source = assetImages[`../..${custom}`] || custom || (Object.hasOwn(productImages, product.code) ? productImages[product.code] : "");
    const [failed, setFailed] = useState(null);
    return source && failed !== source
        ? <img className="kynex-product-image" src={source} alt={product.name} loading="lazy" onError={() => setFailed(source)} />
        : <i className={`bi ${product.icon || "bi-box-seam"}`} aria-hidden="true" />;
}

export default ProductImage;
