import { useCallback, useEffect, useState } from "react";
import { listManagedUsers } from "../services/adminUsers.js";
import { SESSION_KEY, USERS_KEY } from "../services/auth.js";

function useManagedUsers() {
    const [result, setResult] = useState(listManagedUsers);
    const reload = useCallback(() => { const next = listManagedUsers(); setResult(next); return next; }, []);

    useEffect(() => {
        function handleStorage(event) {
            if ((!event.storageArea || event.storageArea === localStorage) && [USERS_KEY, SESSION_KEY, null].includes(event.key)) reload();
        }
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [reload]);
    return { ...result, reload };
}

export default useManagedUsers;
