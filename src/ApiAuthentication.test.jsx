import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ApiAuthProvider from "./context/ApiAuthProvider.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AccountActions from "./components/molecules/AccountActions.jsx";
import { createApiSession } from "./services/api/session.js";
import { ApiError } from "./services/api/client.js";
import { PERMISSIONS } from "./utils/permissions.js";
import { fillRegistration, registrationData } from "./test/registration.js";

const identity = { id: 33, firstName: "Daniela", lastName: "Muñoz", email: "daniela@example.com", role: "Cliente" };
const issued = user => ({ accessToken: "access-private", expiresIn: 600, user });
afterEach(() => { localStorage.clear(); sessionStorage.clear(); vi.unstubAllGlobals(); });

function show({ handlers = {}, path = "/login" } = {}) {
    const request = vi.fn(async (url, options) => {
        if (url === "/auth/csrf") return { token: "csrf" };
        if (handlers[url]) return handlers[url](options);
        throw new ApiError("Sin sesión", 401);
    });
    const session = createApiSession({ request, lock: work => work() });
    render(<ApiAuthProvider session={session}><MemoryRouter initialEntries={[path]}>
        <AccountActions />
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistrationPage />} />
            <Route path="/productos" element={<h1>Tienda pública</h1>} />
            <Route element={<ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS} />}>
                <Route path="/admin/productos" element={<h1>Inventario privado</h1>} />
                <Route path="/admin" element={<h1>Panel privado</h1>} />
            </Route>
        </Routes>
    </MemoryRouter></ApiAuthProvider>);
    return { session, request };
}

describe("Autenticación integrada con API", () => {
    it("espera la recuperación antes de presentar contenido privado o redirigir", async () => {
        let finish;
        show({ path: "/admin/productos", handlers: { "/auth/refresh": () => new Promise(resolve => { finish = resolve; }) } });
        expect(screen.queryByRole("heading", { name: "Inventario privado" })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).not.toBeInTheDocument();
        await waitFor(() => expect(finish).toBeTypeOf("function"));
        await act(async () => finish(issued({ ...identity, role: "Administrador" })));
        expect(await screen.findByRole("heading", { name: "Inventario privado" })).toBeInTheDocument();
    });
    it("ignora una sesión local alterada y no ofrece cuentas de demostración", async () => {
        localStorage.setItem("kynex_session", JSON.stringify({ id: 1, role: "Administrador" }));
        show({ path: "/admin/productos" });
        expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
        expect(screen.queryByText("Cuentas de demostración")).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Inventario privado" })).not.toBeInTheDocument();
    });
    it("permite una contraseña larga y regresa al destino administrativo autorizado", async () => {
        const { request } = show({ path: "/admin/productos", handlers: { "/auth/login": () => issued({ ...identity, role: "Administrador" }) } });
        await screen.findByRole("heading", { name: "Iniciar sesión" });
        const user = userEvent.setup();
        await user.type(screen.getByRole("textbox", { name: "Correo electrónico", exact: true }), identity.email);
        await user.type(screen.getByLabelText(/^Contraseña/), "MiClaveSegura2026!");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { name: "Inventario privado" })).toBeInTheDocument();
        expect(request).toHaveBeenCalledWith("/auth/login", expect.objectContaining({ body: { email: identity.email, password: "MiClaveSegura2026!" } }));
        expect(localStorage.getItem("kynex_session")).toBeNull();
        expect(JSON.stringify({ ...localStorage })).not.toContain("access-private");
    });
    it("registra el perfil completo con contraseña elegida y sin otorgar un rol desde el formulario", async () => {
        const { request } = show({ path: "/registro", handlers: { "/auth/register": () => identity } });
        await screen.findByRole("heading", { name: "Crear cuenta" });
        const user = userEvent.setup();
        await fillRegistration(user, { ...registrationData, email: identity.email });
        await user.type(screen.getByLabelText(/^Contraseña/), "ClavePersonal2026!");
        await user.type(screen.getByLabelText(/^Confirmar contraseña/), "ClavePersonal2026!");
        await user.click(screen.getByRole("button", { name: "Crear cuenta", exact: true }));
        expect(await screen.findByRole("status")).toHaveTextContent("Cuenta creada correctamente");
        const payload = request.mock.calls.find(([url]) => url === "/auth/register")[1].body;
        expect(payload).toEqual({ ...registrationData, email: identity.email, password: "ClavePersonal2026!" });
        expect(payload).not.toHaveProperty("role"); expect(payload).not.toHaveProperty("passwordConfirmation");
        expect(screen.getByRole("link", { name: "Iniciar sesión con mi cuenta" })).toBeInTheDocument();
    });
    it("restringe al Cliente que intenta entrar directamente a administración", async () => {
        show({ path: "/admin/productos", handlers: { "/auth/refresh": () => issued(identity) } });
        expect(await screen.findByRole("heading", { name: "Tienda pública" })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Administración" })).not.toBeInTheDocument();
    });
    it("comunica un fallo de recuperación y reintenta sin mostrar datos privados", async () => {
        let available = false;
        show({ path: "/admin/productos", handlers: { "/auth/refresh": () => {
            if (!available) throw new ApiError("El servidor no está disponible");
            return issued({ ...identity, role: "Administrador" });
        } } });
        expect((await screen.findAllByText("El servidor no está disponible", { selector: "p" }))[0]).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Inventario privado" })).not.toBeInTheDocument();
        available = true;
        await userEvent.click(screen.getByRole("button", { name: "Reintentar sesión" }));
        expect(await screen.findByRole("heading", { name: "Inventario privado" })).toBeInTheDocument();
    });
    it("retira la vista privada al cerrar sesión", async () => {
        const { request } = show({ path: "/admin/productos", handlers: { "/auth/refresh": () => issued({ ...identity, role: "Administrador" }), "/auth/logout": () => null } });
        await screen.findByRole("heading", { name: "Inventario privado" });
        await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
        expect(request).toHaveBeenCalledWith("/auth/logout", expect.objectContaining({ credentials: "include", method: "POST" }));
    });
    it("aplica un cierre recibido de otra pestaña sin transmitir credenciales", async () => {
        let receiver;
        const postMessage = vi.fn();
        vi.stubGlobal("BroadcastChannel", class { constructor() { receiver = this; } postMessage = postMessage; close() {} });
        show({ path: "/admin/productos", handlers: { "/auth/refresh": () => issued({ ...identity, role: "Administrador" }) } });
        await screen.findByRole("heading", { name: "Inventario privado" });
        act(() => receiver.onmessage({ data: { type: "logout" } }));
        expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
        expect(postMessage).not.toHaveBeenCalled();
    });
});
