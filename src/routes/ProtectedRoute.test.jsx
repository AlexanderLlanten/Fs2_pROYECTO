import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AuthProvider from "../context/AuthContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { defaultUsers } from "../data/users.js";
import { loginUser, SESSION_KEY, USERS_KEY } from "../services/auth.js";
import { PERMISSIONS } from "../utils/permissions.js";
import ProtectedRoute from "./ProtectedRoute.jsx";

function LoginDestination() {
    const { state } = useLocation();
    const navigate = useNavigate();
    return <>
        <h1>Login</h1>
        <output aria-label="Origen del acceso">{JSON.stringify(state?.from)}</output>
        <button onClick={() => navigate(-1)}>Volver</button>
    </>;
}

function PrivateContent({ onMount }) {
    const { logout } = useAuth();
    useEffect(() => { onMount?.(); }, [onMount]);
    return <><h1>Contenido privado</h1><button onClick={logout}>Cerrar sesión</button></>;
}

function renderGuard({ permission = PERMISSIONS.USERS_MANAGE, path = "/admin/usuarios?busqueda=Camila", onMount } = {}) {
    return render(<AuthProvider><MemoryRouter initialEntries={["/productos", path]} initialIndex={1}>
        <Routes>
            <Route path="/productos" element={<h1>Tienda</h1>} />
            <Route path="/login" element={<LoginDestination />} />
            <Route element={<ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS} />}>
                <Route path="/admin" element={<h1>Panel</h1>} />
                <Route element={<ProtectedRoute permission={permission} />}>
                    <Route path="/admin/usuarios" element={<PrivateContent onMount={onMount} />} />
                </Route>
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route path="/cuenta" element={<PrivateContent />} />
            </Route>
        </Routes>
    </MemoryRouter></AuthProvider>);
}

describe("ProtectedRoute", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it("no monta contenido privado para un visitante y conserva ruta y filtros para Login", () => {
        const onMount = vi.fn();
        renderGuard({ onMount });
        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        expect(screen.getByLabelText("Origen del acceso")).toHaveTextContent('{"pathname":"/admin/usuarios","search":"?busqueda=Camila"}');
        expect(screen.queryByRole("heading", { name: "Contenido privado" })).not.toBeInTheDocument();
        expect(onMount).not.toHaveBeenCalled();
    });

    it("reemplaza la entrada protegida del historial para no crear un ciclo al volver", async () => {
        const user = userEvent.setup();
        renderGuard();
        await user.click(screen.getByRole("button", { name: "Volver" }));
        expect(screen.getByRole("heading", { name: "Tienda" })).toBeInTheDocument();
    });

    it.each([
        ["camila@gmail.com", "Tienda"],
        ["martin@duoc.cl", "Panel"],
        ["admin@profesor.duoc.cl", "Contenido privado"]
    ])("aplica el permiso de usuarios al ingresar como %s", (email, heading) => {
        loginUser(email, "1234");
        const onMount = vi.fn();
        renderGuard({ onMount });
        expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
        expect(onMount).toHaveBeenCalledTimes(heading === "Contenido privado" ? 1 : 0);
    });

    it.each(["camila@gmail.com", "martin@duoc.cl", "admin@profesor.duoc.cl"])("admite una ruta que solo exige sesión para %s", email => {
        loginUser(email, "1234");
        renderGuard({ path: "/cuenta" });
        expect(screen.getByRole("heading", { name: "Contenido privado" })).toBeInTheDocument();
    });

    it.each(["desconocido", "", null])("deniega permisos no reconocidos incluso a Administrador: %s", permission => {
        loginUser("admin@profesor.duoc.cl", "1234");
        renderGuard({ permission });
        expect(screen.getByRole("heading", { name: "Panel" })).toBeInTheDocument();
    });

    it("revalida el permiso al cambiar el rol en otra pestaña y desmonta el contenido", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        renderGuard();
        expect(screen.getByRole("heading", { name: "Contenido privado" })).toBeInTheDocument();
        act(() => {
            localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => user.id === 3 ? { ...user, role: "Vendedor" } : user)));
            window.dispatchEvent(new StorageEvent("storage", { key: USERS_KEY, storageArea: localStorage }));
        });
        expect(screen.getByRole("heading", { name: "Panel" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Contenido privado" })).not.toBeInTheDocument();
    });

    it("retira el contenido si eliminan al usuario en otra pestaña", () => {
        loginUser("admin@profesor.duoc.cl", "1234");
        renderGuard();
        act(() => {
            localStorage.setItem(USERS_KEY, "[]");
            window.dispatchEvent(new StorageEvent("storage", { key: USERS_KEY, storageArea: localStorage }));
        });
        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Contenido privado" })).not.toBeInTheDocument();
    });

    it("usa el rol del usuario guardado aunque la sesión indique uno con más permisos", () => {
        const { session } = loginUser("martin@duoc.cl", "1234");
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, role: "Administrador" }));
        renderGuard();
        expect(screen.getByRole("heading", { name: "Panel" })).toBeInTheDocument();
    });

    it("redirige a Login al cerrar sesión desde el contenido protegido", async () => {
        const user = userEvent.setup();
        loginUser("admin@profesor.duoc.cl", "1234");
        renderGuard();
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
});
