/*
 * Pruebas automatizadas.
 * Pruebas de RegistrationPage. Casos: «ofrece registro al visitante y explica la contraseña
 * demostrativa»; «envía al panel a un Vendedor que ya tiene sesión».
 */

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "../context/AuthContext.jsx";
import { loginUser } from "../services/auth.js";
import RegistrationPage from "./RegistrationPage.jsx";

function renderPage(from) {
    render(<AuthProvider><MemoryRouter initialEntries={[{ pathname: "/registro", state: { from } }]}>
        <Routes>
            <Route path="/registro" element={<RegistrationPage />} />
            <Route path="/productos" element={<h1>Catálogo</h1>} />
            <Route path="/carrito" element={<h1>Mi carrito</h1>} />
            <Route path="/admin" element={<h1>Panel de gestión</h1>} />
        </Routes>
    </MemoryRouter></AuthProvider>);
}

describe("RegistrationPage", () => {
    beforeEach(() => localStorage.clear());
    it("ofrece registro al visitante y explica la contraseña demostrativa", () => {
        renderPage();
        expect(screen.getByRole("heading", { level: 1, name: "Crear cuenta" })).toBeInTheDocument();
        expect(screen.getByRole("form", { name: "Formulario de registro" })).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: "Únete a KYNEX" })).toHaveTextContent("1234");
    });
    it("envía al panel a un Vendedor que ya tiene sesión", () => {
        loginUser("martin@duoc.cl", "1234");
        renderPage();
        expect(screen.getByRole("heading", { name: "Panel de gestión" })).toBeInTheDocument();
    });
    it.each([[undefined, "Catálogo"], [{ pathname: "/carrito" }, "Mi carrito"], [{ pathname: "//otro.test" }, "Catálogo"]])(
        "redirige una sesión vigente a un destino público válido: %s", async (from, heading) => {
            loginUser("camila@gmail.com", "1234");
            renderPage(from);
            expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
            expect(screen.queryByRole("form")).not.toBeInTheDocument();
        }
    );
});
