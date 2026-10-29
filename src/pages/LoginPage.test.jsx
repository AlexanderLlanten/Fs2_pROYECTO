/*
 * Pruebas automatizadas.
 * Pruebas de LoginPage. Casos: «ofrece el formulario y las cuentas iniciales para un visitante»;
 * «retorna al catálogo con los filtros de la página de origen».
 */

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import AuthProvider from "../context/AuthContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { loginUser, SESSION_KEY } from "../services/auth.js";
import LoginPage from "./LoginPage.jsx";

function Destination() {
    const { user } = useAuth();
    const { pathname, search } = useLocation();
    return (
        <>
            <h1>Destino del acceso</h1>
            <output aria-label="Destino actual">{pathname}{search}</output>
            <output aria-label="Perfil actual">{user?.role}</output>
        </>
    );
}

function renderPage(from) {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={[{ pathname: "/login", state: { from } }]}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/productos" element={<Destination />} />
                    <Route path="/carrito" element={<Destination />} />
                    <Route path="/admin" element={<Destination />} />
                </Routes>
            </MemoryRouter>
        </AuthProvider>
    );
}

async function submitCredentials(user, email, password = "1234") {
    await user.type(screen.getByRole("textbox", { name: "Correo electrónico" }), email);
    await user.type(screen.getByLabelText(/^Contraseña/), password);
    await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
}

describe("LoginPage", () => {
    beforeEach(() => localStorage.clear());

    it("ofrece el formulario y las cuentas iniciales para un visitante", () => {
        renderPage();
        expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
        expect(screen.getByRole("form", { name: "Formulario de inicio de sesión" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: "Cuentas de demostración" })).toHaveTextContent("1234");
    });

    it.each([
        ["camila@gmail.com", "Cliente"],
        ["martin@duoc.cl", "Vendedor"],
        ["admin@profesor.duoc.cl", "Administrador"]
    ])("ingresa con %s y conserva el perfil %s", async (email, role) => {
        const user = userEvent.setup();
        renderPage();

        await submitCredentials(user, email);

        expect(await screen.findByRole("heading", { name: "Destino del acceso" })).toBeInTheDocument();
        expect(screen.getByLabelText("Destino actual")).toHaveTextContent(role === "Cliente" ? "/productos" : "/admin");
        expect(screen.getByLabelText("Perfil actual")).toHaveTextContent(role);
        expect(JSON.parse(localStorage.getItem(SESSION_KEY))).toMatchObject({ email, role });
    });

    it("retorna al catálogo con los filtros de la página de origen", async () => {
        const user = userEvent.setup();
        renderPage({ pathname: "/productos", search: "?categoria=Vitaminas" });

        await submitCredentials(user, "camila@gmail.com");

        expect(await screen.findByLabelText("Destino actual")).toHaveTextContent("/productos?categoria=Vitaminas");
    });

    it("regresa al panel solicitado después de autenticar un vendedor", async () => {
        const user = userEvent.setup();
        renderPage({ pathname: "/admin", search: "?vista=resumen" });
        await submitCredentials(user, "martin@duoc.cl");
        expect(await screen.findByLabelText("Destino actual")).toHaveTextContent("/admin?vista=resumen");
    });

    it("descarta un origen administrativo si ingresa un Cliente", async () => {
        const user = userEvent.setup();
        renderPage({ pathname: "/admin" });
        await submitCredentials(user, "camila@gmail.com");
        expect(await screen.findByLabelText("Destino actual")).toHaveTextContent("/productos");
    });

    it("redirige al visitante que ya tiene sesión sin volver a mostrar el formulario", async () => {
        loginUser("camila@gmail.com", "1234");
        renderPage({ pathname: "/carrito" });

        expect(await screen.findByLabelText("Destino actual")).toHaveTextContent("/carrito");
        expect(screen.queryByRole("form")).not.toBeInTheDocument();
    });

    it("conserva el formulario cuando el servicio rechaza las credenciales", async () => {
        const user = userEvent.setup();
        renderPage();
        await submitCredentials(user, "camila@gmail.com", "errada");

        expect(screen.getByRole("alert")).toHaveTextContent("La contraseña ingresada no es correcta.");
        expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
});
