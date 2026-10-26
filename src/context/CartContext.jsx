import { createContext, useEffect, useMemo, useState } from "react";
import useCatalog from "../hooks/useCatalog.js";
import { CART_KEY, calculateCartSummary, normalizeQuantity } from "../utils/cart.js";

export const CartContext = createContext(null);

function readStoredCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

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
    const [storedCart, setCart] = useState(readStoredCart);
    const [storageError, setStorageError] = useState("");
    const cart = useMemo(() => reconcileCart(storedCart, catalog.products), [storedCart, catalog.products]);
    const detailedCart = useMemo(() => cart.map(item => ({
        ...catalog.products.find(product => product.id === item.id), quantity: item.quantity
    })), [cart, catalog.products]);
    const summary = useMemo(() => calculateCartSummary(detailedCart), [detailedCart]);

    useEffect(() => {
        // Un fallo al leer el catálogo no debe borrar una compra guardada.
        if (!catalog.success) return;
        if (JSON.stringify(storedCart) !== JSON.stringify(cart)) setCart(cart);
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            setStorageError("");
        } catch { setStorageError("No fue posible guardar el carrito. Los cambios se conservarán mientras esta página siga abierta."); }
    }, [cart, storedCart, catalog.success]);

    function addToCart(candidate, quantity = 1) {
        if (!catalog.success || !Number.isSafeInteger(quantity) || quantity <= 0) return;
        // Consultar el producto vigente, incluso si el consumidor conserva una copia antigua.
        const product = catalog.products.find(item => item.id === candidate?.id);
        if (!product || product.stock <= 0) return;
        setCart(current => {
            const next = reconcileCart(current, catalog.products);
            const existing = next.find(item => item.id === product.id);
            return existing
                ? next.map(item => item.id === product.id ? { ...item, quantity: normalizeQuantity(item.quantity + quantity, product.stock) } : item)
                : [...next, { id: product.id, quantity: normalizeQuantity(quantity, product.stock) }];
        });
    }

    function increaseQuantity(id) {
        if (!catalog.success) return;
        const product = catalog.products.find(item => item.id === id);
        if (!product) return;
        setCart(current => reconcileCart(current, catalog.products).map(item => item.id === id
            ? { ...item, quantity: normalizeQuantity(item.quantity + 1, product.stock) } : item));
    }
    function decreaseQuantity(id) {
        if (!catalog.success) return;
        setCart(current => reconcileCart(current, catalog.products)
            .map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
            .filter(item => item.quantity > 0));
    }
    function removeFromCart(id) { setCart(current => current.filter(item => item?.id !== id)); }
    function clearCart() { setCart([]); }

    return <CartContext.Provider value={{
        cart, detailedCart, ...summary, storageError,
        addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart
    }}>{children}</CartContext.Provider>;
}

export default CartProvider;
