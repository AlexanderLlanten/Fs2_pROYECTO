import { useEffect } from "react";
import { usesApi } from "../config/dataSource.js";
import { remoteCatalog } from "../services/api/catalogStore.js";
import useCart from "../hooks/useCart.js";

/** Reconsulta datos públicos y etiquetas del carrito ante cambios del catálogo o al volver a la ventana. */
export default function CatalogSync() {
    const { reloadCart } = useCart();
    useEffect(() => {
        if (!usesApi) return;
        const refresh = () => { if (document.visibilityState !== "hidden") { void remoteCatalog.reload(); void reloadCart?.(); } };
        window.addEventListener("focus",refresh); window.addEventListener("kynex-catalog-changed",refresh);
        let channel;
        if (typeof BroadcastChannel !== "undefined") {
            channel = new BroadcastChannel("kynex-catalog-events");
            channel.onmessage = event => { if (event.data?.type === "catalog-changed") refresh(); };
        }
        return () => { window.removeEventListener("focus",refresh);window.removeEventListener("kynex-catalog-changed",refresh);channel?.close(); };
    },[reloadCart]);
    return null;
}
