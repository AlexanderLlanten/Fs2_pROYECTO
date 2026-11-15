import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CartContext } from "./cartContext.js";
import { createAccountCart } from "../services/api/cart.js";

function ApiCartProvider({ ownerId, children }) {
    const channel = useRef(null);
    const [store] = useState(() => createAccountCart({ ownerId, notify: () => channel.current?.postMessage({ type: "cart-changed" }) }));
    const resource = useSyncExternalStore(store.subscribe, store.read, store.read);
    useEffect(() => {
        void store.reload({ merge: true });
        const refresh = () => { if (document.visibilityState !== "hidden") void store.reload(); };
        window.addEventListener("focus", refresh);
        if (typeof BroadcastChannel !== "undefined") {
            channel.current = new BroadcastChannel("kynex-cart-events");
            channel.current.onmessage = event => { if (event.data?.type === "cart-changed") void store.reload(); };
        }
        return () => { window.removeEventListener("focus", refresh); channel.current?.close(); channel.current = null; };
    }, [store]);
    return <CartContext.Provider value={{ ...resource,
        cart: resource.items.map(item => ({ id: item.id, quantity: item.quantity })), detailedCart: resource.items,
        cartLoading: resource.loading, cartBusy: resource.busy, storageError: resource.error,
        addToCart: store.add, increaseQuantity: store.increase, decreaseQuantity: store.decrease,
        removeFromCart: store.remove, clearCart: store.clear, reloadCart: store.reload
    }}>{children}</CartContext.Provider>;
}
export default ApiCartProvider;
