import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import CategoryCard from "./CategoryCard.jsx";

function CurrentLocation() {
    const { pathname, search } = useLocation();
    return <output aria-label="Ubicación actual">{pathname}{search}</output>;
}

describe("CategoryCard", () => {
    it("navega al catálogo conservando las tildes de la categoría en la URL", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <CategoryCard category={{
                    name: "Proteínas",
                    icon: "bi-cup-straw",
                    description: "Explora proteínas para tu objetivo."
                }} />
                <CurrentLocation />
            </MemoryRouter>
        );

        expect(screen.getByRole("heading", { level: 3, name: "Proteínas" })).toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "Explorar Proteínas" }));
        expect(screen.getByLabelText("Ubicación actual")).toHaveTextContent("/productos?categoria=Prote%C3%ADnas");
    });
});
