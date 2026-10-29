/*
 * Pruebas automatizadas.
 * Pruebas de Footer. Casos: «muestra la identidad KYNEX, el año actual y enlaces a las rutas
 * disponibles»; «navega con React Router desde el pie de página».
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Footer from "./Footer.jsx";

describe("Footer", () => {
    it("muestra la identidad KYNEX, el año actual y enlaces a las rutas disponibles", () => {
        render(<MemoryRouter><Footer /></MemoryRouter>);
        const footer = within(screen.getByRole("contentinfo"));
        const nav = within(footer.getByRole("navigation", { name: "Navegación del pie de página" }));

        expect(footer.getByRole("link", { name: "KYNEX" })).toHaveAttribute("href", "/");
        expect(footer.getByText(/Plataforma deportiva orientada a suplementación/)).toBeInTheDocument();
        expect(footer.getByText(`© ${new Date().getFullYear()} KYNEX. Todos los derechos reservados.`)).toBeInTheDocument();
        expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
        expect(nav.getByRole("link", { name: "Tienda" })).toHaveAttribute("href", "/productos");
        expect(nav.getByRole("link", { name: "Carrito" })).toHaveAttribute("href", "/carrito");
        expect(nav.getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "/contacto");
        expect(nav.getByRole("link", { name: "Entrenamiento" })).toHaveAttribute("href", "/entrenamiento");
        expect(nav.getByRole("link", { name: "Mi rutina" })).toHaveAttribute("href", "/rutina");
        expect(nav.getByRole("link", { name: "Nosotros" })).toHaveAttribute("href", "/nosotros");
        expect(nav.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute("href", "/blog");
    });

    it("navega con React Router desde el pie de página", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Footer />
                <Routes>
                    <Route path="/productos" element={<h1>Catálogo</h1>} />
                    <Route path="/" element={<h1>Inicio</h1>} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("link", { name: "Tienda" }));
        expect(screen.getByRole("heading", { name: "Catálogo" })).toBeInTheDocument();
    });
});
