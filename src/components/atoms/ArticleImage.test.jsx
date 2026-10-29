/*
 * Pruebas automatizadas.
 * Pruebas de ArticleImage. Casos: «presenta la imagen con texto alternativo y carga diferida»;
 * «sustituye una imagen fallida y permite mostrar una nueva».
 */

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ArticleImage from "./ArticleImage.jsx";

describe("ArticleImage", () => {
    it("presenta la imagen con texto alternativo y carga diferida", () => {
        render(<ArticleImage src="/ejemplo.jpg" alt="Imagen de prueba" />);
        expect(screen.getByRole("img", { name: "Imagen de prueba" })).toHaveAttribute("src", "/ejemplo.jpg");
        expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
    });
    it.each([undefined, ""])("ofrece una alternativa accesible si falta la imagen: %s", src => {
        render(<ArticleImage src={src} alt="Imagen de prueba" />);
        expect(screen.getByRole("img", { name: "Imagen de prueba" })).toHaveTextContent("Imagen no disponible");
    });
    it("sustituye una imagen fallida y permite mostrar una nueva", () => {
        const { rerender } = render(<ArticleImage src="/fallida.jpg" alt="Primera imagen" />);
        fireEvent.error(screen.getByRole("img")); expect(screen.getByText("Imagen no disponible")).toBeInTheDocument();
        rerender(<ArticleImage src="/nueva.jpg" alt="Nueva imagen" />);
        expect(screen.getByRole("img", { name: "Nueva imagen" })).toHaveAttribute("src", "/nueva.jpg");
        expect(screen.queryByText("Imagen no disponible")).not.toBeInTheDocument();
    });
});
