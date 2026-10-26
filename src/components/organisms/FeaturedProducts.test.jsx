import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { products } from "../../data/products.js";
import FeaturedProducts from "./FeaturedProducts.jsx";

describe("FeaturedProducts", () => {
    it("muestra solo destacados y entrega el producto elegido al carrito", async () => {
        const user = userEvent.setup();
        const onAddToCart = vi.fn();
        render(
            <MemoryRouter>
                <FeaturedProducts products={products} onAddToCart={onAddToCart} />
            </MemoryRouter>
        );

        expect(screen.getAllByRole("article")).toHaveLength(3);
        expect(screen.queryByRole("heading", { name: "Multivitamínico Daily" })).not.toBeInTheDocument();
        const card = screen.getByRole("heading", { level: 3, name: "Creatina Monohidratada" }).closest("article");
        expect(within(card).getByRole("link", { name: "Ver detalle" })).toHaveAttribute("href", "/productos/2");

        await user.click(within(card).getByRole("button", { name: "Agregar" }));
        expect(onAddToCart).toHaveBeenCalledExactlyOnceWith(products[1]);
        expect(screen.getByRole("link", { name: "Ver todo el catálogo" })).toHaveAttribute("href", "/productos");
    });

    it.each([
        { label: "catálogo vacío", items: [] },
        { label: "catálogo sin destacados", items: products.map(product => ({ ...product, featured: false })) }
    ])(
        "omite la sección con $label",
        ({ items }) => {
            const { container } = render(
                <MemoryRouter>
                    <FeaturedProducts products={items} />
                </MemoryRouter>
            );
            expect(container).toBeEmptyDOMElement();
        }
    );
});
