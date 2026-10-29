/*
 * Servicio local de datos y operaciones.
 * Lee y valida el catálogo persistido, completa metadatos ausentes y ofrece una instantánea estable.
 * Notifica cambios locales y entre pestañas y centraliza la escritura.
 */

import { products as defaultProducts } from "../data/products.js";
import { getProductErrors, normalizeProduct, parseProductId } from "../utils/products.js";
import { completeProductDetails } from "../utils/productDetails.js";

export const PRODUCTS_KEY = "kynex_products";
const PRODUCTS_CHANGED = "kynex:products-changed";
const storageError = { success: false, products: [], message: "No fue posible leer el catálogo del almacenamiento. Inténtalo nuevamente.", code: "STORAGE" };
const corrupted = { success: false, products: [], message: "El catálogo guardado no se puede leer correctamente. No se modificaron tus datos.", code: "CORRUPTED" };
let lastRaw;
let snapshot;

// Una instantánea estable permite compartir el catálogo sin duplicar estado por página.
// Lee, valida y completa productos, manteniendo una instantánea estable mientras el texto persistido
// permanezca igual.
export function readCatalog() {
    let raw;
    try { raw = localStorage.getItem(PRODUCTS_KEY); }
    catch { return storageError; }
    // Se conserva la referencia del resultado cuando el JSON no cambia; crear otro objeto en cada
    // lectura produciría actualizaciones innecesarias del suscriptor.
    if (snapshot && raw === lastRaw) return snapshot;
    let result;
    try {
        // Solo la ausencia de la clave utiliza los productos iniciales. Un catálogo guardado vacío
        // sigue siendo un catálogo válido.
        const parsed = raw === null ? defaultProducts : JSON.parse(raw);
        // Estos conjuntos detectan identificadores y códigos repetidos antes de aceptar el catálogo
        // leído.
        const ids = new Set();
        const codes = new Set();
        if (!Array.isArray(parsed) || parsed.some(product => {
            if (!product || parseProductId(product.id) !== product.id || Object.keys(getProductErrors(product)).length) return true;
            const code = normalizeProduct(product).code;
            if (ids.has(product.id) || codes.has(code)) return true;
            ids.add(product.id); codes.add(code);
            return false;
        })) result = corrupted;
        else result = { success: true, products: parsed.map(product => completeProductDetails({ ...product, ...normalizeProduct(product) })) };
    } catch { result = corrupted; }
    lastRaw = raw;
    snapshot = result;
    return snapshot;
}

// Emite el evento local que solicita revisar el catálogo.
export function refreshCatalog() { window.dispatchEvent(new Event(PRODUCTS_CHANGED)); }

// Registra cambios del almacenamiento y del evento local de catálogo. Devuelve una función que retira
// ambos oyentes.
export function subscribeCatalog(listener) {
    // Manejador que filtra eventos de almacenamiento relevantes antes de actualizar el recurso o la
    // sesión.
    function handleStorage(event) {
        if ((!event.storageArea || event.storageArea === localStorage) && [PRODUCTS_KEY, null].includes(event.key)) listener();
    }
    // storage informa cambios de otras pestañas. El evento propio informa a los componentes de esta
    // misma ventana.
    window.addEventListener("storage", handleStorage);
    window.addEventListener(PRODUCTS_CHANGED, listener);
    return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(PRODUCTS_CHANGED, listener);
    };
}

// Guarda el catálogo convertido a JSON y notifica a sus suscriptores después de una escritura
// correcta.
export function persistProducts(products) {
    // Primero se guarda el JSON y después se notifica. Si la escritura falla, la excepción llega al
    // servicio que informa el error.
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    refreshCatalog();
}
