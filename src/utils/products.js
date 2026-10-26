export const PRODUCT_CATEGORIES = ["Proteínas", "Creatinas", "Pre-entreno", "Vitaminas", "Aminoácidos", "Otros"];

const text = value => typeof value === "string" ? value.trim() : "";
const numeric = value => (typeof value === "number" || typeof value === "string") && text(String(value)) !== "" ? Number(value) : NaN;

export function productImageSource(value) {
    const source = text(value);
    if (!source) return "";
    if (/^(?:\.\.?\/)*assets\//.test(source)) return `/${source.slice(source.indexOf("assets/"))}`;
    if (/^\/assets\//.test(source) && !source.includes("\\")) return source;
    try {
        const url = new URL(source);
        return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
    } catch { return ""; }
}

export function normalizeProduct(values = {}) {
    return {
        code: text(values.code).toUpperCase(), category: text(values.category), name: text(values.name),
        description: text(values.description), price: numeric(values.price), stock: numeric(values.stock),
        criticalStock: values.criticalStock == null || text(String(values.criticalStock)) === "" ? null : numeric(values.criticalStock),
        image: productImageSource(values.image)
    };
}

export function getProductErrors(values = {}) {
    const data = normalizeProduct(values);
    const errors = {};
    if (data.code.length < 3) errors.code = "El código debe tener al menos 3 caracteres.";
    if (!PRODUCT_CATEGORIES.includes(data.category)) errors.category = "Selecciona una categoría válida.";
    if (!data.name || data.name.length > 100) errors.name = "El nombre es obligatorio y admite hasta 100 caracteres.";
    if (data.description.length > 500) errors.description = "La descripción no puede superar 500 caracteres.";
    if (!Number.isFinite(data.price) || data.price < 0) errors.price = "El precio debe ser un número igual o superior a 0.";
    if (!Number.isSafeInteger(data.stock) || data.stock < 0) errors.stock = "El stock debe ser un entero igual o superior a 0.";
    if (data.criticalStock !== null && (!Number.isSafeInteger(data.criticalStock) || data.criticalStock < 0)) errors.criticalStock = "El stock crítico debe ser un entero igual o superior a 0.";
    if (text(values.image) && !data.image) errors.image = "Usa una URL http(s) o una ruta dentro de /assets/.";
    return errors;
}

export const isCriticalStock = product => product.criticalStock !== null && product.criticalStock !== undefined && product.stock <= product.criticalStock;

export function parseProductId(value) {
    return /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
}
