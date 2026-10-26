import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import CartProvider from "../context/CartContext.jsx";
import { CART_KEY } from "../utils/cart.js";
import HomePage from "./HomePage.jsx";

function renderHome() {
    render(<CartProvider><MemoryRouter><HomePage /></MemoryRouter></CartProvider>);
}

describe("HomePage", () => {
    beforeEach(() => localStorage.clear());

    it("muestra la identidad KYNEX, la imagen original y accesos al catálogo", () => {
        renderHome();

        expect(screen.getByRole("heading", { level: 1, name: "Entrena mejor. Supérate." })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Productos KYNEX en un entorno de entrenamiento" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Explorar productos" })).toHaveAttribute("href", "/productos");
        expect(screen.getByRole("link", { name: "Ir a la tienda" })).toHaveAttribute("href", "/productos");
        expect(screen.getByRole("link", { name: "Ver destacados" })).toHaveAttribute("href", "#productos-destacados");
        expect(screen.getByRole("region", { name: "Productos destacados" })).toHaveAttribute("id", "productos-destacados");
        expect(screen.getByRole("region", { name: "Información de despacho" })).toHaveTextContent("Despacho gratis en compras desde $50.000");
        expect(screen.getByRole("heading", { name: "Suplementación clara" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Entrenamiento", exact: true })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Evolución deportiva" })).toBeInTheDocument();
        expect(screen.queryByText(/migración desde HTML/i)).not.toBeInTheDocument();
    });

    it("recupera los objetivos, el entrenamiento, los artículos y el acceso al registro", () => {
        renderHome();
        const goals = within(screen.getByRole("region", { name: "¿Qué quieres conseguir?" }));
        expect(goals.getAllByRole("link")).toHaveLength(4);
        for (const name of ["Aumento de masa", "Energía", "Recuperación", "Descanso"]) {
            expect(goals.getByRole("link", { name })).toHaveAttribute("href", "/productos");
        }
        expect(screen.getByRole("link", { name: "Ver entrenamientos" })).toHaveAttribute("href", "/entrenamiento");
        expect(screen.getByRole("link", { name: "Explorar tienda" })).toHaveAttribute("href", "/productos");
        expect(screen.getByRole("link", { name: "Ver ejercicios", exact: true })).toHaveAttribute("href", "/entrenamiento");
        expect(screen.getByRole("link", { name: "Conocer KYNEX" })).toHaveAttribute("href", "/nosotros");
        const training = within(screen.getByRole("region", { name: "Del suplemento al entrenamiento" }));
        expect(training.getByRole("img")).toHaveAttribute("src", expect.stringContaining("training-hero-deadlift.jpg"));
        expect(training.getByRole("link", { name: "Explorar ejercicios" })).toHaveAttribute("href", "/entrenamiento");
        expect(training.getByRole("link", { name: "Mi rutina" })).toHaveAttribute("href", "/rutina");
        const blog = within(screen.getByRole("region", { name: "Aprende más", exact: true }));
        expect(blog.getAllByRole("article")).toHaveLength(2);
        expect(blog.getAllByRole("img")).toHaveLength(2);
        expect(blog.getByRole("link", { name: "Leer artículo: Creatina y rendimiento" })).toHaveAttribute("href", "/blog/creatina-y-rendimiento");
        expect(blog.getByRole("link", { name: "Leer artículo: Recuperación muscular" })).toHaveAttribute("href", "/blog/recuperacion-muscular");
        expect(blog.getByRole("link", { name: "Ver todos los artículos" })).toHaveAttribute("href", "/blog");
        expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/registro");
    });

    it("conserva el video original con título accesible y alternativa de apertura", () => {
        renderHome();
        const media = within(screen.getByRole("region", { name: "Contenido audiovisual" }));
        const frame = media.getByTitle("Contenido audiovisual de entrenamiento");
        expect(frame).toHaveAttribute("src", "https://www.youtube.com/embed/UBMk30rjy0o");
        expect(frame).toHaveAttribute("loading", "lazy");
        expect(frame.getAttribute("src")).not.toContain("autoplay");
        const link = media.getByRole("link", { name: "Ver video en YouTube (nueva pestaña)" });
        expect(link).toHaveAttribute("href", "https://www.youtube.com/watch?v=UBMk30rjy0o");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("usa los datos de destacados y guarda las compras realizadas desde el inicio", async () => {
        const user = userEvent.setup();
        renderHome();
        const featured = within(screen.getByRole("region", { name: "Productos destacados" }));
        const card = featured.getByRole("heading", { level: 3, name: "Creatina Monohidratada" }).closest("article");

        expect(featured.queryByRole("heading", { name: "Multivitamínico Daily" })).not.toBeInTheDocument();
        await user.click(within(card).getByRole("button", { name: "Agregar" }));

        expect(featured.getByRole("status")).toHaveTextContent("Agregaste Creatina Monohidratada al carrito.");
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 1 }]);
    });

    it("respeta el stock y explica cuando el carrito ya tiene todas las unidades", async () => {
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 24 }]));
        const user = userEvent.setup();
        renderHome();
        const card = screen.getByRole("heading", { name: "Creatina Monohidratada" }).closest("article");
        const addButton = within(card).getByRole("button", { name: "Agregar" });

        await user.click(addButton);
        await user.click(addButton);

        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 25 }]);
        expect(screen.getByRole("status")).toHaveTextContent("Ya alcanzaste el stock disponible de Creatina Monohidratada en tu carrito.");
    });
});
