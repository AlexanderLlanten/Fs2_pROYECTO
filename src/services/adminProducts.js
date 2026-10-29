/*
 * Servicio local de datos y operaciones.
 * Autoriza y coordina lectura, alta, edición y eliminación. Valida datos, códigos únicos y conflictos
 * con la versión esperada; persiste el catálogo a través de productStore.
 */

import { getSession } from "./auth.js";
import { persistProducts, readCatalog } from "./productStore.js";
import { getProductErrors, normalizeProduct, parseProductId } from "../utils/products.js";
import { hasPermission, PERMISSIONS } from "../utils/permissions.js";

const forbidden = { success: false, code: "FORBIDDEN", message: "No tienes permiso para modificar productos." };
const notFound = { success: false, code: "NOT_FOUND", message: "No fue posible encontrar el producto solicitado." };
const changed = { success: false, code: "CONFLICT", message: "Este producto cambió desde que lo abriste. Recarga sus datos antes de continuar." };
const storageError = { success: false, code: "STORAGE", message: "No fue posible guardar el catálogo en este navegador. Inténtalo nuevamente." };

// Comprueba permiso de gestión de productos antes de entregar el catálogo al servicio administrativo.
function readManagedCatalog() {
    if (!hasPermission(getSession()?.role, PERMISSIONS.PRODUCTS_MANAGE)) return forbidden;
    return readCatalog();
}

// Obtiene un producto para gestión tras comprobar permiso, lectura e identificador.
export function getManagedProduct(id) {
    try {
        const result = readManagedCatalog();
        if (!result.success) return result;
        const product = result.products.find(item => parseProductId(id) === id && item.id === id);
        return product ? { success: true, product } : notFound;
    } catch { return storageError; }
}

// Compara el registro actual con la copia esperada para detectar que cambió desde que se abrió el
// formulario.
const conflict = (product, expected) => expected && JSON.stringify(product) !== JSON.stringify(expected);

// Crea o modifica un producto, conserva metadatos existentes, valida campos y código único y rechaza
// conflictos antes de guardar.
export function saveManagedProduct(values, { id, expectedProduct } = {}) {
    try {
        const store = readManagedCatalog();
        if (!store.success) return store;
        // Se diferencia alta de edición y se compara el producto esperado antes de guardar, para
        // detectar modificaciones de otra pestaña.
        const previous = id !== undefined ? store.products.find(item => parseProductId(id) === id && item.id === id) : null;
        if (id !== undefined && !previous) return notFound;
        if (previous && conflict(previous, expectedProduct)) return changed;
        const errors = getProductErrors(values);
        const data = normalizeProduct(values);
        if (store.products.some(item => item.id !== id && item.code === data.code)) errors.code = "Ya existe otro producto con este código.";
        if (Object.keys(errors).length) return { success: false, errors, message: "Revisa los campos marcados antes de guardar el producto." };
        // En edición se conservan los metadatos existentes. En alta se crean valores iniciales; data
        // reemplaza solo los campos editables y slug prepara un nombre para rutas.
        const product = {
            ...(previous ?? { id: Math.max(Date.now(), ...store.products.map(item => item.id + 1)), brand: "KYNEX Nutrition", featured: false, format: "Sin especificar", flavor: "Sin especificar", icon: "bi-box-seam" }),
            ...data, slug: data.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        };
        persistProducts(previous ? store.products.map(item => item.id === id ? product : item) : [...store.products, product]);
        return { success: true, product };
    } catch { return storageError; }
}

// Comprueba permiso, identidad y versión esperada y guarda el catálogo sin el producto seleccionado.
export function deleteManagedProduct(id, expectedProduct) {
    try {
        const store = readManagedCatalog();
        if (!store.success) return store;
        const product = store.products.find(item => parseProductId(id) === id && item.id === id);
        if (!product) return notFound;
        if (conflict(product, expectedProduct)) return changed;
        persistProducts(store.products.filter(item => item.id !== id));
        return { success: true };
    } catch { return storageError; }
}
