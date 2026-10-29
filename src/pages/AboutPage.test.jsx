/*
 * Pruebas automatizadas.
 * Pruebas de AboutPage. Casos: «conserva la presentación, propuesta, experiencia, visión y
 * compromisos de KYNEX»; «enlaza las cuatro categorías y ambos accesos al catálogo mediante React
 * Router».
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AboutPage from "./AboutPage.jsx";

describe("AboutPage", () => {
    it("conserva la presentación, propuesta, experiencia, visión y compromisos de KYNEX", () => {
        render(<MemoryRouter><AboutPage /></MemoryRouter>);
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(screen.getByRole("heading", { level: 1, name: "Nuestra tienda" })).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Una tienda pensada para quienes buscan avanzar" })).toHaveTextContent("KYNEX es una tienda especializada");
        expect(screen.getByRole("heading", { name: "Una experiencia integrada" })).toBeInTheDocument();
        const proposal = within(screen.getByRole("region", { name: "Más que un catálogo de productos" }));
        expect(proposal.getAllByRole("article")).toHaveLength(3);
        expect(proposal.getByRole("heading", { name: "Información clara" })).toBeInTheDocument();
        expect(proposal.getByText(/descripción, formato, precio y disponibilidad/)).toBeInTheDocument();
        const experience = within(screen.getByRole("region", { name: "Una tienda simple, organizada y funcional" }));
        for (const name of ["Búsqueda sencilla", "Detalle completo", "Carrito de compra", "Contenido especializado"]) {
            expect(experience.getByRole("heading", { level: 3, name })).toBeInTheDocument();
        }
        expect(screen.getByRole("region", { name: "Seguir creciendo junto a nuestros usuarios" })).toHaveTextContent("nuevas categorías, contenidos y herramientas");
        const commitments = within(screen.getByRole("region", { name: "Una mejor experiencia de compra" }));
        for (const name of ["Claridad", "Organización", "Accesibilidad", "Evolución"]) expect(commitments.getByRole("heading", { level: 3, name })).toBeInTheDocument();
    });
    it("enlaza las cuatro categorías y ambos accesos al catálogo mediante React Router", () => {
        render(<MemoryRouter><AboutPage /></MemoryRouter>);
        const catalog = within(screen.getByRole("region", { name: "Productos para distintos objetivos" }));
        for (const name of ["Proteínas", "Creatinas", "Pre-entreno", "Vitaminas"]) {
            expect(catalog.getByRole("link", { name: `Explorar ${name}` })).toHaveAttribute("href", `/productos?${new URLSearchParams({ categoria: name })}`);
        }
        expect(screen.getByRole("link", { name: "Explorar catálogo" })).toHaveAttribute("href", "/productos");
        expect(screen.getByRole("link", { name: "Ir a la tienda" })).toHaveAttribute("href", "/productos");
        expect(screen.queryByRole("banner")).not.toBeInTheDocument();
        expect(screen.queryByRole("main")).not.toBeInTheDocument();
        expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    });
});
