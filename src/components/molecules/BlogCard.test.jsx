/*
 * Pruebas automatizadas.
 * Pruebas de BlogCard. Casos: «presenta los datos recibidos por props y abre su ruta de lectura».
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BlogCard from "./BlogCard.jsx";

describe("BlogCard", () => {
    it("presenta los datos recibidos por props y abre su ruta de lectura", async () => {
        const user = userEvent.setup();
        const article = { slug: "articulo-de-prueba", title: "Título de prueba", category: "Categoría", excerpt: "Resumen del artículo.", image: "/prueba.jpg", imageAlt: "Ilustración de prueba" };
        render(<MemoryRouter><Routes>
            <Route path="/" element={<BlogCard article={article} />} />
            <Route path="/blog/articulo-de-prueba" element={<h1>Lectura de prueba</h1>} />
        </Routes></MemoryRouter>);
        expect(screen.getByRole("article", { name: "Título de prueba" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: "Título de prueba" })).toBeInTheDocument();
        expect(screen.getByText("Resumen del artículo.")).toBeInTheDocument(); expect(screen.getByText("Categoría")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Ilustración de prueba" })).toHaveAttribute("src", "/prueba.jpg");
        const link = screen.getByRole("link", { name: "Leer artículo: Título de prueba" });
        expect(link).toHaveAttribute("href", "/blog/articulo-de-prueba"); await user.click(link);
        expect(screen.getByRole("heading", { name: "Lectura de prueba" })).toBeInTheDocument();
    });
});
