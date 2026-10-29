/*
 * Organismo de interfaz.
 * Compone los bloques ampliados de un producto: objetivos, ingredientes, alérgenos, beneficios, uso,
 * nutrición, advertencias y certificaciones disponibles.
 */

import { useId } from "react";
import Badge from "../atoms/Badge.jsx";
import ProductInfoList from "../molecules/ProductInfoList.jsx";
import { productCalories, productList, productRecord, productText } from "../../utils/productDetails.js";

function ProductInformation({ product }) {
    const id = useId();
    const usage = productRecord(product.usage);
    const nutrition = productRecord(product.nutrition);
    const certifications = productList(product.certifications);
    const noAllergens = Array.isArray(product.allergens) && product.allergens.length === 0;
    const nutritionRows = [
        ["Tamaño de porción", productText(nutrition.servingSize)], ["Calorías", productCalories(nutrition.calories)],
        ["Proteínas", productText(nutrition.protein)], ["Carbohidratos", productText(nutrition.carbohydrates)], ["Grasas", productText(nutrition.fats)]
    ];
    return <div className="product-information-react">
        <div className="product-info-grid">
            <ProductInfoList title="Beneficios" items={product.benefits} />
            <ProductInfoList title="Ingredientes" items={product.ingredients} />
            <ProductInfoList title="Alérgenos" items={product.allergens} emptyText={noAllergens ? "No se informan alérgenos." : "No se dispone de información sobre alérgenos."} />
            <section className="product-info-panel" aria-labelledby={`${id}-usage`}>
                <h2 id={`${id}-usage`}>Modo de uso</h2><dl>
                    {[["Porción", usage.serving], ["Preparación", usage.preparation], ["Momento de consumo", usage.moment]].map(([label, value]) =>
                        <div key={label}><dt>{label}</dt><dd>{productText(value)}</dd></div>)}
                </dl>
            </section>
        </div>
        <section className="product-nutrition" aria-labelledby={`${id}-nutrition`}>
            <p className="kynex-eyebrow">INFORMACIÓN DEL PRODUCTO</p><h2 id={`${id}-nutrition`}>Información nutricional</h2>
            <table><caption className="visually-hidden">Información nutricional por porción</caption>
                <thead><tr><th scope="col">Nutriente</th><th scope="col">Por porción</th></tr></thead>
                <tbody>{nutritionRows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody>
            </table>
        </section>
        <section className="product-safety-react" aria-labelledby={`${id}-safety`}>
            <p className="kynex-eyebrow">TRANSPARENCIA</p><h2 id={`${id}-safety`}>Calidad y seguridad</h2>
            {certifications.length ? <ul className="product-certifications" aria-label="Certificaciones registradas">{certifications.map((value, index) =>
                <li key={`${index}-${value}`}><Badge><i className="bi bi-patch-check me-2" aria-hidden="true" />{value}</Badge></li>)}</ul> : <p>Sin certificaciones registradas</p>}
            <aside className="product-warning" aria-label="Advertencia del producto"><h3>Advertencia</h3>
                <p>{productText(product.warning, "Producto demostrativo. Revisar indicaciones antes de utilizar.")}</p>
            </aside>
        </section>
    </div>;
}

export default ProductInformation;
