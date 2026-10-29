/*
 * Pruebas automatizadas.
 * Pruebas de ProductInformation. Casos: «presenta ingredientes, beneficios, alérgenos, uso y
 * nutrición originales»; «distingue alérgenos vacíos informados y conserva cero calorías».
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ProductInformation from "./ProductInformation.jsx";
import { products } from "../../data/products.js";

describe("ProductInformation", () => {
    it("presenta ingredientes, beneficios, alérgenos, uso y nutrición originales", () => {
        render(<ProductInformation product={products[0]} />);
        expect(screen.getByRole("region", { name: "Ingredientes" })).toHaveTextContent("Proteína de suero de leche");
        expect(screen.getByRole("region", { name: "Beneficios" })).toHaveTextContent("Aporte de proteínas");
        expect(within(screen.getByRole("region", { name: "Alérgenos" })).getAllByRole("listitem").map(item => item.textContent)).toEqual(["Leche", "Soya"]);
        expect(screen.getByRole("region", { name: "Modo de uso" })).toHaveTextContent("Mezclar una porción con 250 ml");
        const table = within(screen.getByRole("table", { name: "Información nutricional por porción" }));
        expect(table.getByRole("row", { name: "Calorías 120 kcal" })).toBeInTheDocument();
        expect(table.getByRole("row", { name: "Proteínas 24 g" })).toBeInTheDocument();
        expect(table.getByRole("columnheader", { name: "Por porción" })).toHaveAttribute("scope", "col");
        expect(screen.getByRole("complementary", { name: "Advertencia del producto" })).toHaveTextContent(products[0].warning);
    });
    it("distingue alérgenos vacíos informados y conserva cero calorías", () => {
        render(<ProductInformation product={products[1]} />);
        expect(screen.getByRole("region", { name: "Alérgenos" })).toHaveTextContent("No se informan alérgenos.");
        expect(screen.getByRole("row", { name: "Calorías 0 kcal" })).toBeInTheDocument();
        expect(screen.getByRole("list", { name: "Certificaciones registradas" })).toHaveTextContent("Vegan");
    });
    it("muestra información no especificada para un producto nuevo sin ficha", () => {
        render(<ProductInformation product={{}} />);
        expect(screen.getByRole("region", { name: "Ingredientes" })).toHaveTextContent("No especificado");
        expect(screen.getByRole("region", { name: "Alérgenos" })).toHaveTextContent("No se dispone de información sobre alérgenos.");
        expect(screen.getByRole("row", { name: "Calorías No especificado" })).toBeInTheDocument();
        expect(screen.getByText("Sin certificaciones registradas")).toBeInTheDocument();
    });
    it("tolera metadatos de tipos inesperados y conserva el texto como texto", () => {
        render(<ProductInformation product={{ benefits: [{ bad: true }], allergens: null, ingredients: ["<script>prueba</script>", 3], usage: [], nutrition: { protein: {} }, certifications: "GMP", warning: {} }} />);
        expect(screen.getByText("<script>prueba</script>")).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Beneficios" })).toHaveTextContent("No especificado");
        expect(screen.getByRole("region", { name: "Modo de uso" })).toHaveTextContent("No especificado");
        expect(screen.getByRole("row", { name: "Proteínas No especificado" })).toBeInTheDocument();
    });
});
