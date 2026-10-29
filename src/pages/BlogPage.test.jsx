/*
 * Pruebas automatizadas.
 * Pruebas de BlogPage. Casos: «muestra los dos artículos originales con imagen, categoría y resumen»;
 * «ofrece enlaces distinguibles y compone contenido sin duplicar el layout».
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BlogPage from "./BlogPage.jsx";

describe("BlogPage", () => {
    it("muestra los dos artículos originales con imagen, categoría y resumen", () => {
        render(<MemoryRouter><BlogPage /></MemoryRouter>);
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(screen.getByRole("heading", { level: 1, name: "Blog" })).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Aprende más sobre rendimiento" })).toBeInTheDocument();
        expect(screen.getAllByRole("article")).toHaveLength(2);
        expect(screen.getByRole("heading", { name: "Creatina y rendimiento" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Recuperación muscular" })).toBeInTheDocument();
        expect(screen.getByText("Suplementación")).toBeInTheDocument(); expect(screen.getByText("Entrenamiento")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Imagen representativa de creatina y rendimiento deportivo" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Imagen representativa de recuperación muscular" })).toBeInTheDocument();
        expect(screen.getByText(/Conoce por qué el descanso/)).toBeInTheDocument();
    });
    it("ofrece enlaces distinguibles y compone contenido sin duplicar el layout", () => {
        render(<MemoryRouter><BlogPage /></MemoryRouter>);
        expect(screen.getByRole("link", { name: "Leer artículo: Creatina y rendimiento" })).toHaveAttribute("href", "/blog/creatina-y-rendimiento");
        expect(screen.getByRole("link", { name: "Leer artículo: Recuperación muscular" })).toHaveAttribute("href", "/blog/recuperacion-muscular");
        expect(screen.getByRole("link", { name: "Ver productos" })).toHaveAttribute("href", "/productos");
        expect(screen.queryByRole("banner")).not.toBeInTheDocument(); expect(screen.queryByRole("main")).not.toBeInTheDocument();
        expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    });
});
