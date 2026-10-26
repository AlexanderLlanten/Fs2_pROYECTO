import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ProductImage from "./ProductImage.jsx";

describe("ProductImage", () => {
    it("muestra texto alternativo y recupera el ícono cuando falla una imagen", () => {
        const { container, rerender } = render(<ProductImage product={{ name: "Prueba", image: "/assets/prueba.jpg", icon: "bi-fire" }} />);
        const image = screen.getByRole("img", { name: "Prueba" });
        expect(image).toHaveAttribute("src", "/assets/prueba.jpg");
        fireEvent.error(image);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(container.querySelector("i")).toHaveClass("bi-fire");
        rerender(<ProductImage product={{ name: "Prueba", image: "/assets/otra.jpg" }} />);
        expect(screen.getByRole("img")).toHaveAttribute("src", "/assets/otra.jpg");
    });
    it("usa el ícono para una imagen ausente o no admitida", () => {
        const { container } = render(<ProductImage product={{ name: "Prueba", image: "javascript:alert(1)" }} />);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(container.querySelector("i")).toHaveClass("bi-box-seam");
    });
});
