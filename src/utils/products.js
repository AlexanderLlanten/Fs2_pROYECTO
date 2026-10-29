/*
 * Reglas y funciones auxiliares.
 * Normaliza y valida productos, direcciones de imagen e identificadores. Centraliza las condiciones
 * de stock crítico y los errores de campos administrativos.
 */

export const PRODUCT_CATEGORIES = ["Proteínas", "Creatinas", "Pre-entreno", "Vitaminas", "Aminoácidos", "Otros"];

// Conserva un texto sin espacios exteriores; devuelve texto vacío para otros tipos de dato.
const text = value => typeof value === "string" ? value.trim() : "";
// Convierte números o textos numéricos a número. Un dato vacío o de otro tipo produce NaN y será
// rechazado por la validación.
const numeric = value => (typeof value === "number" || typeof value === "string") && text(String(value)) !== "" ? Number(value) : NaN;

// Valida y normaliza la dirección de imagen admitida para el catálogo.
export function productImageSource(value) {
    const source = text(value);
    if (!source) return "";
    // Las rutas de imágenes heredadas se convierten al formato /assets/. Las direcciones externas
    // solo admiten http o https sin credenciales.
    if (/^(?:\.\.?\/)*assets\//.test(source)) return `/${source.slice(source.indexOf("assets/"))}`;
    if (/^\/assets\//.test(source) && !source.includes("\\")) return source;
    try {
        const url = new URL(source);
        return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
    } catch { return ""; }
}

// Prepara campos textuales y numéricos de un producto para su validación y persistencia.
export function normalizeProduct(values = {}) {
    return {
        code: text(values.code).toUpperCase(), category: text(values.category), name: text(values.name),
        description: text(values.description), price: numeric(values.price), stock: numeric(values.stock),
        criticalStock: values.criticalStock == null || text(String(values.criticalStock)) === "" ? null : numeric(values.criticalStock),
        image: productImageSource(values.image)
    };
}

// Devuelve los errores de código, nombre, precio, stock, categoría y demás campos del producto.
export function getProductErrors(values = {}) {
    const data = normalizeProduct(values);
    // Este validador agrega únicamente los campos con error; por eso un objeto sin propiedades
    // significa que los datos son válidos.
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

// Comprueba si el stock cumple el umbral crítico del producto.
export const isCriticalStock = product => product.criticalStock !== null && product.criticalStock !== undefined && product.stock <= product.criticalStock;

// Acepta un identificador formado por dígitos y devuelve su número entero seguro positivo; para un
// dato inválido devuelve null.
export function parseProductId(value) {
    return /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
}
