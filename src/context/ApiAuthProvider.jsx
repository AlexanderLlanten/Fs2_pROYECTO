import { Fragment, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { AuthContext } from "./authContext.js";
import { apiSession } from "../services/api/session.js";
import { hasPermission } from "../utils/permissions.js";

// Comparte identidad validada y coordina renovación y avisos entre pestañas sin guardar tokens.
function ApiAuthProvider({ children, session = apiSession }) {
    const resource = useSyncExternalStore(session.subscribe, session.read, session.read);
    const channel = useRef(null);
    useEffect(() => {
        void session.initialize();
        const verify = () => { if (document.visibilityState !== "hidden" && session.read().user) void session.identity(); };
        window.addEventListener("focus", verify);
        document.addEventListener("visibilitychange", verify);
        if (typeof BroadcastChannel !== "undefined") {
            channel.current = new BroadcastChannel("kynex-session-events");
            channel.current.onmessage = event => {
                if (event.data?.type === "logout") session.invalidate(true);
                if (event.data?.type === "login") { session.invalidate(); void session.restore(); }
                if (event.data?.type === "account-updated" && session.read().user) void session.identity();
            };
        }
        return () => {
            window.removeEventListener("focus", verify);
            document.removeEventListener("visibilitychange", verify);
            channel.current?.close(); channel.current = null;
        };
    }, [session]);
    useEffect(() => {
        if (!resource.user) return;
        const timer = setTimeout(() => { void session.restore(); }, Math.max(1000, session.expiresIn() - 30000));
        return () => clearTimeout(timer);
    }, [resource, session]);
    const value = useMemo(() => ({
        ...resource, isLoading: resource.loading, sessionError: resource.error, isRemote: true,
        isAuthenticated: resource.user !== null,
        async login(email, password) {
            const result = await session.login(email, password);
            if (result.success) channel.current?.postMessage({ type: "login" });
            return result;
        },
        async logout() {
            channel.current?.postMessage({ type: "logout" });
            return session.logout();
        },
        register: session.register, refreshSession: session.identity, retrySession: resource.logoutPending ? session.logout : session.restore,
        hasRole: (...roles) => resource.user !== null && roles.includes(resource.user.role),
        hasPermission: permission => resource.user !== null && hasPermission(resource.user.role, permission)
    }), [resource, session]);
    return <AuthContext.Provider value={value}><Fragment key={resource.user?.id ?? "visitor"}>{children}</Fragment></AuthContext.Provider>;
}
export default ApiAuthProvider;
