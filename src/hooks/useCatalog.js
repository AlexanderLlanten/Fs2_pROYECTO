/*
 * Hook reutilizable de React.
 * Suscribe React al almacén de productos mediante useSyncExternalStore. Devuelve la instantánea y una
 * función de recarga.
 */

import { useSyncExternalStore } from "react";
import { readCatalog, refreshCatalog, subscribeCatalog } from "../services/productStore.js";

function useCatalog() {
    // useSyncExternalStore suscribe la interfaz al catálogo. readCatalog devuelve la misma
    // instantánea mientras el almacenamiento no cambie.
    const resource = useSyncExternalStore(subscribeCatalog, readCatalog, readCatalog);
    return { ...resource, reload: refreshCatalog };
}

export default useCatalog;
