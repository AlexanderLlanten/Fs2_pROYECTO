/*
 * Pruebas automatizadas.
 * Pruebas de ArticleContent. Casos: «conserva los párrafos, cuatro recomendaciones y nota del
 * artículo de creatina»; «presenta las secciones, cinco factores y nota académica de recuperación».
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ArticleContent from "./ArticleContent.jsx";
import { articles } from "../../data/articles.js";

describe("ArticleContent", () => {
    it("conserva los párrafos, cuatro recomendaciones y nota del artículo de creatina", () => {
        render(<MemoryRouter><ArticleContent article={articles[0]} /></MemoryRouter>);
        expect(screen.getByRole("article", { name: "Creatina y rendimiento" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2, name: "¿Qué es la creatina?" })).toBeInTheDocument();
        expect(screen.getByText(/se encuentra de forma natural en el organismo/)).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Creatina dentro del entrenamiento" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Información importante" })).toBeInTheDocument();
        expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(4);
        expect(screen.getByRole("complementary", { name: "Nota informativa" })).toHaveTextContent("no sustituye la orientación de un especialista");
        expect(screen.getByText("Lectura breve")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Volver al blog" })).toHaveAttribute("href", "/blog");
    });
    it("presenta las secciones, cinco factores y nota académica de recuperación", () => {
        render(<MemoryRouter><ArticleContent article={articles[1]} /></MemoryRouter>);
        expect(screen.getByRole("heading", { name: "El descanso también forma parte del plan" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Factores asociados a la recuperación" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Suplementación y recuperación" })).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(5);
        expect(screen.getByText("Identificar señales de fatiga excesiva.")).toBeInTheDocument();
        expect(screen.getByRole("complementary", { name: "Contenido demostrativo" })).toHaveTextContent("fines académicos e informativos");
    });
});
