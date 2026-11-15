import { useCallback, useEffect, useRef, useState } from "react";
import { apiSession } from "../services/api/session.js";

// Ignora respuestas de una consulta anterior o de una vista que ya se desmontó.
export default function useApiResource(path, request = apiSession.authorized) {
    const [resource, setResource] = useState({ loading: true, data: null, error: "" });
    const generation = useRef(0);
    const reload = useCallback(async () => {
        const current = ++generation.current;
        setResource(previous => ({ ...previous, loading: true, error: "" }));
        if (!path) { setResource({ loading: false, data: null, error: "" }); return null; }
        try {
            const data = await request(path);
            if (current === generation.current) setResource({ data, loading: false, error: "" });
            return data;
        } catch (error) { if (current === generation.current) setResource({ data: null, loading: false, error: error.message }); return null; }
    }, [path, request]);
    useEffect(() => { void reload(); return () => { generation.current++; }; }, [reload]);
    return { ...resource, reload, update: data => { generation.current++; setResource({ data, loading: false, error: "" }); } };
}
