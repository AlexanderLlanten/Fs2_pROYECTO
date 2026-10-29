/*
 * Estado compartido mediante contexto de React.
 * Mantiene identificadores y cantidades, los reconcilia con el catálogo vigente y deriva el detalle y
 * los totales. Expone operaciones de compra y persiste cuando el catálogo se puede leer.
 */

import { createContext, useEffect, useMemo, useState } from "react";
import useCatalog from "../hooks/useCatalog.js";
import { CART_KEY, calculateCartSummary, normalizeQuantity } from "../utils/cart.js";

export const CartContext = createContext(null);

// Lee kynex_cart e interpreta su JSON. Si falta, está dañado o no es un arreglo, devuelve una lista
// vacía en memoria.
function readStoredCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

// Compara los elementos guardados con el catálogo. Descarta referencias inexistentes, agotadas,
// repetidas o cantidades inválidas y limita las cantidades al stock.
function reconcileCart(cart, products) {
    const seen = new Set();
    return cart.flatMap(item => {
        const product = products.find(product => product.id === item?.id);
        if (!product || product.stock <= 0 || !Number.isSafeInteger(item.quantity) || item.quantity <= 0 || seen.has(item.id)) return [];
        seen.add(item.id);
        return [{ id: item.id, quantity: normalizeQuantity(item.quantity, product.stock) }];
    });
}

function CartProvider({ children }) {
    const catalog = useCatalog();
    // El estado guarda la compra mínima y el error de persistencia. El detalle y los importes se
    // calculan desde esos datos y el catálogo.
    const [storedCart, setCart] = useState(readStoredCart);
    const [storageError, setStorageError] = useState("");
    const cart = useMemo(() => reconcileCart(storedCart, catalog.products), [storedCart, catalog.products]);
    // El carrito guarda id y cantidad; el detalle incorpora precio y demás datos del catálogo vigente
    // para no mantener copias desactualizadas.
    const detailedCart = useMemo(() => cart.map(item => ({
        ...catalog.products.find(product => product.id === item.id), quantity: item.quantity
    })), [cart, catalog.products]);
    // El resumen se deriva del detalle: totalItems suma unidades, mientras que cart.length cuenta
    // productos distintos.
    const summary = useMemo(() => calculateCartSummary(detailedCart), [detailedCart]);

    // Este efecto sincroniza la compra con LocalStorage. Solo escribe cuando pudo leer el catálogo,
    // para no borrar una compra por un error de lectura.
    useEffect(() => {
        // Un fallo al leer el catálogo no debe borrar una compra guardada.
        if (!catalog.success) return;
        if (JSON.stringify(storedCart) !== JSON.stringify(cart)) setCart(cart);
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            setStorageError("");
        } catch { setStorageError("No fue posible guardar el carrito. Los cambios se conservarán mientras esta página siga abierta."); }
    }, [cart, storedCart, catalog.success]);

    // Busca el producto vigente y agrega o incrementa su cantidad respetando stock. Usa una
    // actualización funcional para trabajar sobre el estado más reciente.
    function addToCart(candidate, quantity = 1) {
        if (!catalog.success || !Number.isSafeInteger(quantity) || quantity <= 0) return;
        // Consultar el producto vigente, incluso si el consumidor conserva una copia antigua.
        const product = catalog.products.find(item => item.id === candidate?.id);
        if (!product || product.stock <= 0) return;
        // La función recibe el estado más reciente de React. map y el spread crean una nueva
        // colección sin modificar la anterior.
        setCart(current => {
            const next = reconcileCart(current, catalog.products);
            const existing = next.find(item => item.id === product.id);
            return existing
                ? next.map(item => item.id === product.id ? { ...item, quantity: normalizeQuantity(item.quantity + quantity, product.stock) } : item)
                : [...next, { id: product.id, quantity: normalizeQuantity(quantity, product.stock) }];
        });
    }

    // Incrementa una unidad del producto identificado y respeta su stock vigente.
    function increaseQuantity(id) {
        if (!catalog.success) return;
        const product = catalog.products.find(item => item.id === id);
        if (!product) return;
        setCart(current => reconcileCart(current, catalog.products).map(item => item.id === id
            ? { ...item, quantity: normalizeQuantity(item.quantity + 1, product.stock) } : item));
    }
    // Resta una unidad y retira las entradas cuya cantidad queda en cero.
    function decreaseQuantity(id) {
        if (!catalog.success) return;
        setCart(current => reconcileCart(current, catalog.products)
            .map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
            .filter(item => item.quantity > 0));
    }
    // Conserva todos los elementos salvo el identificador indicado.
    function removeFromCart(id) { setCart(current => current.filter(item => item?.id !== id)); }
    // Reemplaza el estado del carrito por una lista vacía.
    function clearCart() { setCart([]); }

    return <CartContext.Provider value={{
        cart, detailedCart, ...summary, storageError,
        addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart
    }}>{children}</CartContext.Provider>;
}

export default CartProvider;
