import { useSyncExternalStore } from "react";
import { readCatalog, refreshCatalog, subscribeCatalog } from "../services/productStore.js";

function useCatalog() {
    const resource = useSyncExternalStore(subscribeCatalog, readCatalog, readCatalog);
    return { ...resource, reload: refreshCatalog };
}

export default useCatalog;
