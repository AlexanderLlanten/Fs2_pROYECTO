import { products as defaultProducts } from "../data/products.js";
import { getProductErrors, normalizeProduct, parseProductId } from "../utils/products.js";

export const PRODUCTS_KEY = "kynex_products";
const PRODUCTS_CHANGED = "kynex:products-changed";
const storageError = { success: false, products: [], message: "No fue posible leer el catálogo del almacenamiento. Inténtalo nuevamente.", code: "STORAGE" };
const corrupted = { success: false, products: [], message: "El catálogo guardado no se puede leer correctamente. No se modificaron tus datos.", code: "CORRUPTED" };
let lastRaw;
let snapshot;

// Una instantánea estable permite compartir el catálogo sin duplicar estado por página.
export function readCatalog() {
    let raw;
    try { raw = localStorage.getItem(PRODUCTS_KEY); }
    catch { return storageError; }
    if (snapshot && raw === lastRaw) return snapshot;
    let result;
    try {
        const parsed = raw === null ? defaultProducts : JSON.parse(raw);
        const ids = new Set();
        const codes = new Set();
        if (!Array.isArray(parsed) || parsed.some(product => {
            if (!product || parseProductId(product.id) !== product.id || Object.keys(getProductErrors(product)).length) return true;
            const code = normalizeProduct(product).code;
            if (ids.has(product.id) || codes.has(code)) return true;
            ids.add(product.id); codes.add(code);
            return false;
        })) result = corrupted;
        else result = { success: true, products: parsed.map(product => ({ ...product, ...normalizeProduct(product) })) };
    } catch { result = corrupted; }
    lastRaw = raw;
    snapshot = result;
    return snapshot;
}

export function refreshCatalog() { window.dispatchEvent(new Event(PRODUCTS_CHANGED)); }

export function subscribeCatalog(listener) {
    function handleStorage(event) {
        if ((!event.storageArea || event.storageArea === localStorage) && [PRODUCTS_KEY, null].includes(event.key)) listener();
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(PRODUCTS_CHANGED, listener);
    return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(PRODUCTS_CHANGED, listener);
    };
}

export function persistProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    refreshCatalog();
}
