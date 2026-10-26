import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";

import { defaultUsers } from "../data/users.js";
import useAuth from "../hooks/useAuth.js";
import useCart from "../hooks/useCart.js";
import { loginUser, SESSION_KEY, USERS_KEY } from "../services/auth.js";
import { CART_KEY } from "../utils/cart.js";
import AuthProvider from "./AuthContext.jsx";
import CartProvider from "./CartContext.jsx";

function AuthHarness({ email = "camila@gmail.com" }) {
    const { user, isAuthenticated, login, logout, refreshSession, hasRole } = useAuth();
    const [result, setResult] = useState(null);

    return (
        <>
            <output aria-label="Usuario actual">{user ? `${user.firstName} · ${user.role}` : "Visitante"}</output>
            <output aria-label="Autenticado">{String(isAuthenticated)}</output>
            <output aria-label="Acceso de administrador">{String(hasRole("Administrador"))}</output>
            <output aria-label="Acceso de gestión">{String(hasRole("Administrador", "Vendedor"))}</output>
            <p role="alert">{result?.success === false ? result.message : ""}</p>
            <button onClick={() => setResult(login(email, "1234"))}>Ingresar</button>
            <button onClick={() => setResult(login(email, "incorrecta"))}>Probar contraseña incorrecta</button>
            <button onClick={() => setResult(logout())}>Cerrar sesión</button>
            <button onClick={refreshSession}>Actualizar sesión</button>
        </>
    );
}

function CartSnapshot() {
    const { totalItems } = useCart();
    return <output aria-label="Unidades del carrito">{totalItems}</output>;
}

function renderAuth(props = {}) {
    return render(<AuthProvider><AuthHarness {...props} /></AuthProvider>);
}

function emitStorage(key, storageArea = localStorage) {
    act(() => {
        window.dispatchEvent(new StorageEvent("storage", { key, storageArea }));
    });
}

describe("AuthContext y useAuth", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it("presenta un visitante sin roles cuando no existe una sesión", () => {
        renderAuth();

        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent("Visitante");
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("false");
        expect(screen.getByLabelText("Acceso de administrador")).toHaveTextContent("false");
        expect(screen.getByLabelText("Acceso de gestión")).toHaveTextContent("false");
        expect(localStorage.getItem(USERS_KEY)).toBeNull();
    });

    it.each([
        ["camila@gmail.com", "Cliente", "false", "false"],
        ["martin@duoc.cl", "Vendedor", "false", "true"],
        ["admin@profesor.duoc.cl", "Administrador", "true", "true"]
    ])("actualiza la sesión y consultas de rol al ingresar como %s", async (email, role, admin, management) => {
        const user = userEvent.setup();
        renderAuth({ email });

        await user.click(screen.getByRole("button", { name: "Ingresar", exact: true }));

        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent(role);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("true");
        expect(screen.getByLabelText("Acceso de administrador")).toHaveTextContent(admin);
        expect(screen.getByLabelText("Acceso de gestión")).toHaveTextContent(management);
        expect(JSON.parse(localStorage.getItem(SESSION_KEY))).toMatchObject({ email, role });
    });

    it("devuelve el error de autenticación sin abrir una sesión", async () => {
        const user = userEvent.setup();
        renderAuth();

        await user.click(screen.getByRole("button", { name: "Probar contraseña incorrecta" }));

        expect(screen.getByRole("alert")).toHaveTextContent("La contraseña ingresada no es correcta.");
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("false");
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it("recupera la sesión guardada al volver a montar el proveedor", async () => {
        const user = userEvent.setup();
        const firstRender = renderAuth();
        await user.click(screen.getByRole("button", { name: "Ingresar", exact: true }));
        firstRender.unmount();

        renderAuth();

        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent("Camila · Cliente");
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("true");
    });

    it("conserva la sesión actual si falla otro intento de acceso", async () => {
        const user = userEvent.setup();
        renderAuth();
        await user.click(screen.getByRole("button", { name: "Ingresar", exact: true }));
        const storedSession = localStorage.getItem(SESSION_KEY);

        await user.click(screen.getByRole("button", { name: "Probar contraseña incorrecta" }));

        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent("Camila · Cliente");
        expect(localStorage.getItem(SESSION_KEY)).toBe(storedSession);
    });

    it("cierra la sesión y conserva el estado y almacenamiento del carrito", async () => {
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 3 }]));
        const user = userEvent.setup();
        render(
            <AuthProvider>
                <CartProvider><AuthHarness /><CartSnapshot /></CartProvider>
            </AuthProvider>
        );
        await user.click(screen.getByRole("button", { name: "Ingresar", exact: true }));
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent("Visitante");
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("false");
        expect(screen.getByLabelText("Unidades del carrito")).toHaveTextContent("3");
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 3 }]);
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(localStorage.getItem(USERS_KEY)).not.toBeNull();
    });

    it("informa el fallo de cierre y conserva la sesión si no se pudo eliminar", async () => {
        loginUser("camila@gmail.com", "1234");
        const user = userEvent.setup();
        renderAuth();
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
            throw new DOMException("Almacenamiento bloqueado", "SecurityError");
        });

        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

        expect(screen.getByRole("alert")).toHaveTextContent(/almacenamiento/i);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("true");
    });

    it("sincroniza la sesión, cambios de rol y eliminación del usuario desde otra pestaña", () => {
        renderAuth();
        loginUser("admin@profesor.duoc.cl", "1234");
        emitStorage(SESSION_KEY);
        expect(screen.getByLabelText("Acceso de administrador")).toHaveTextContent("true");

        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers.map(user => (
            user.id === 3 ? { ...user, role: "Cliente" } : user
        ))));
        emitStorage(USERS_KEY);
        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent("Administrador · Cliente");
        expect(screen.getByLabelText("Acceso de administrador")).toHaveTextContent("false");

        localStorage.setItem(USERS_KEY, "[]");
        emitStorage(USERS_KEY);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("false");
    });

    it("sincroniza el cierre y el borrado completo realizados en otra pestaña", () => {
        loginUser("camila@gmail.com", "1234");
        renderAuth();

        localStorage.removeItem(SESSION_KEY);
        emitStorage(SESSION_KEY);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("false");

        loginUser("camila@gmail.com", "1234");
        emitStorage(SESSION_KEY);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("true");

        localStorage.clear();
        emitStorage(null);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("false");
    });

    it("ignora cambios ajenos a autenticación y eventos de sessionStorage", () => {
        renderAuth();
        loginUser("camila@gmail.com", "1234");

        emitStorage(CART_KEY);
        emitStorage(SESSION_KEY, sessionStorage);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("false");

        emitStorage(SESSION_KEY);
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("true");
    });

    it("permite releer una sesión modificada por otro consumidor en la misma pestaña", async () => {
        const user = userEvent.setup();
        renderAuth();
        loginUser("martin@duoc.cl", "1234");

        await user.click(screen.getByRole("button", { name: "Actualizar sesión" }));

        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent("Martín · Vendedor");
    });

    it("mantiene la sesión cuando cambia el contenido de React Router", async () => {
        const user = userEvent.setup();
        render(
            <AuthProvider>
                <MemoryRouter>
                    <Routes>
                        <Route path="/" element={<><AuthHarness /><Link to="/otra">Continuar</Link></>} />
                        <Route path="/otra" element={<><h1>Otra página</h1><AuthHarness /></>} />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>
        );
        await user.click(screen.getByRole("button", { name: "Ingresar", exact: true }));
        await user.click(screen.getByRole("link", { name: "Continuar" }));

        expect(screen.getByRole("heading", { name: "Otra página" })).toBeInTheDocument();
        expect(screen.getByLabelText("Usuario actual")).toHaveTextContent("Camila · Cliente");
        expect(screen.getByLabelText("Autenticado")).toHaveTextContent("true");
    });

    it("explica el uso incorrecto de useAuth fuera del proveedor", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<AuthHarness />)).toThrow("useAuth debe utilizarse dentro de AuthProvider.");
    });
});
