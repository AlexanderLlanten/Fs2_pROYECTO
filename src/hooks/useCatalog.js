/*
 * Hook reutilizable de React.
 * Suscribe React al almacén de productos mediante useSyncExternalStore. Devuelve la instantánea y una
 * función de recarga.
 */

import { useSyncExternalStore } from "react";
import { readCatalog, refreshCatalog, subscribeCatalog } from "../services/productStore.js";
import { remoteCatalog } from "../services/api/catalogStore.js";
import { usesApi } from "../config/dataSource.js";

// EP3 permite comprobar la lectura del servidor mientras se integran los módulos privados.
const useApi = usesApi;

function useCatalog() {
    // useSyncExternalStore suscribe la interfaz al catálogo. readCatalog devuelve la misma
    // instantánea mientras el almacenamiento no cambie.
    const resource = useSyncExternalStore(useApi ? remoteCatalog.subscribe : subscribeCatalog,
        useApi ? remoteCatalog.read : readCatalog, useApi ? remoteCatalog.read : readCatalog);
    return { ...resource, reload: useApi ? remoteCatalog.reload : refreshCatalog };
}

export default useCatalog;
