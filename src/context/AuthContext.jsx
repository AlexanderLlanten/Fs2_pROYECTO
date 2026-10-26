import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import {
    getSession,
    loginUser,
    logoutUser,
    SESSION_KEY,
    USERS_KEY
} from "../services/auth.js";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(getSession);

    const refreshSession = useCallback(() => {
        const session = getSession();
        setUser(session);
        return session;
    }, []);

    const login = useCallback((email, password) => {
        const result = loginUser(email, password);

        if (result.success) {
            setUser(result.session);
        }

        return result;
    }, []);

    const logout = useCallback(() => {
        const result = logoutUser();

        if (result.success) {
            setUser(null);
        }

        return result;
    }, []);

    useEffect(() => {
        function handleStorage(event) {
            if (![SESSION_KEY, USERS_KEY, null].includes(event.key)) {
                return;
            }

            if (event.storageArea && event.storageArea !== localStorage) {
                return;
            }

            refreshSession();
        }

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [refreshSession]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        refreshSession,
        hasRole: (...roles) => user !== null && roles.includes(user.role)
    }), [user, login, logout, refreshSession]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
