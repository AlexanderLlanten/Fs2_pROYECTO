import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import InventorySummary from "./InventorySummary.jsx";

describe("InventorySummary", () => {
    it("resume los productos recibidos y cuenta el stock bajo incluyendo agotados", () => {
        render(<InventorySummary products={[
            { stock: 10, criticalStock: 5 },
            { stock: 3, criticalStock: 3 },
            { stock: 0, criticalStock: 2 }
        ]} />);
        expect(screen.getByRole("article", { name: "Productos en catálogo" })).toHaveTextContent("3");
        expect(screen.getByRole("article", { name: "Unidades en stock" })).toHaveTextContent("13");
        expect(screen.getByRole("article", { name: "Productos con stock bajo" })).toHaveTextContent("2");
    });

    it("muestra ceros para un catálogo vacío", () => {
        render(<InventorySummary products={[]} />);
        for (const card of screen.getAllByRole("article")) expect(card).toHaveTextContent("0");
    });
});
