/*
 * Átomo reutilizable.
 * Resuelve la imagen personalizada, una dirección heredada conocida o la imagen predeterminada del
 * código de producto. Ante ausencia o fallo muestra un icono; el carrito reutiliza este componente.
 */

import { useState } from "react";
import { productImageSource } from "../../utils/products.js";
import { productImages } from "../../data/productImages.js";
import { assetImages } from "../../data/assetImages.js";

function ProductImage({ product }) {
    const custom = productImageSource(product.image);
    // Orden de elección: recurso heredado conocido, imagen personalizada válida e imagen
    // predeterminada del código de producto.
    const source = assetImages[`../..${custom}`] || custom || (Object.hasOwn(productImages, product.code) ? productImages[product.code] : "");
    // Se recuerda qué dirección falló para elegir la alternativa visual sin repetir la misma carga en
    // cada renderizado.
    const [failed, setFailed] = useState(null);
    // El estado recuerda la dirección fallida. Una dirección distinta puede volver a intentarse; el
    // icono evita mostrar una imagen rota.
    return source && failed !== source
        ? <img className="kynex-product-image" src={source} alt={product.name} loading="lazy" onError={() => setFailed(source)} />
        : <i className={`bi ${product.icon || "bi-box-seam"}`} aria-hidden="true" />;
}

export default ProductImage;
