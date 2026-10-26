import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import FeatureSection from "./FeatureSection.jsx";

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
    });
});
