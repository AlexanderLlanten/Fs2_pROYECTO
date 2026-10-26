import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ProductImage from "./ProductImage.jsx";
import { products } from "../../data/products.js";
import { productImages } from "../../data/productImages.js";

describe("ProductImage", () => {
    it("recupera las seis imágenes originales por código sin exigir un campo image", () => {
        const { rerender } = render(<ProductImage product={products[0]} />);
        for (const product of products) {
            rerender(<ProductImage product={product} />);
            expect(screen.getByRole("img", { name: product.name })).toHaveAttribute("src", productImages[product.code]);
        }
    });
    it("prioriza una imagen personalizada sobre la original del código", () => {
        render(<ProductImage product={{ ...products[0], image: "https://example.com/personalizada.jpg" }} />);
        expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/personalizada.jpg");
    });
    it("resuelve una ruta de imagen heredada al recurso empaquetado y respeta la selección personalizada", () => {
        render(<ProductImage product={{ ...products[0], image: "../../assets/img/products/kynex-creatina-monohidratada-unflavored.png" }} />);
        expect(screen.getByRole("img")).toHaveAttribute("src", productImages.KYN002);
    });
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
