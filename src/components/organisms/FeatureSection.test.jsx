import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import FeatureSection from "./FeatureSection.jsx";
import { MemoryRouter } from "react-router-dom";

describe("FeatureSection", () => {
    it("compone una sección identificable con encabezado y tarjetas recibidas por props", () => {
        render(<FeatureSection id="test-features" eyebrow="KYNEX" title="Ventajas de prueba" description="Descripción de la sección."
            features={[{ title: "Primera ventaja", description: "Datos del primer elemento.", icon: "bi-eye" },
                { title: "Segunda ventaja", description: "Datos del segundo elemento.", icon: "bi-grid" }]} />);
        const section = within(screen.getByRole("region", { name: "Ventajas de prueba" }));
        expect(section.getByRole("heading", { level: 2, name: "Ventajas de prueba" })).toHaveAttribute("id", "test-features");
        expect(section.getByText("Descripción de la sección.")).toBeInTheDocument();
        const cards = section.getAllByRole("article"); expect(cards).toHaveLength(2);
        expect(within(cards[0]).getByRole("heading", { level: 3, name: "Primera ventaja" })).toBeInTheDocument();
        expect(within(cards[0]).getByText("Datos del primer elemento.")).toBeInTheDocument();
        expect(within(cards[1]).getByRole("heading", { name: "Segunda ventaja" })).toBeInTheDocument();
        expect(within(cards[1]).getByText("Datos del segundo elemento.")).toBeInTheDocument();
        expect(section.queryByRole("link")).not.toBeInTheDocument();
    });

    it("ofrece acciones opcionales sin convertir las tarjetas informativas en enlaces", () => {
        render(<MemoryRouter><FeatureSection id="features-links" title="Explora KYNEX" features={[
            { title: "Entrena", description: "Ejercicios disponibles", icon: "bi-activity", action: { label: "Abrir entrenamiento", to: "/entrenamiento" } },
            { title: "Información", description: "Contenido sin acción", icon: "bi-info-circle" }
        ]} /></MemoryRouter>);
        expect(screen.getByRole("link", { name: "Abrir entrenamiento" })).toHaveAttribute("href", "/entrenamiento");
        expect(screen.getAllByRole("link")).toHaveLength(1);
        expect(within(screen.getAllByRole("article")[1]).queryByRole("link")).not.toBeInTheDocument();
    });
});
