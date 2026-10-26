import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App.jsx";
import { CART_KEY } from "./utils/cart.js";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { fillRegistration, registrationData } from "./test/registration.js";

describe("Rutas públicas con PublicLayout", () => {
    beforeEach(() => {
        localStorage.clear();
        window.history.replaceState({}, "", "/");
    });

    afterEach(() => {
        window.history.replaceState({}, "", "/");
    });

    it.each([
        ["/", "Entrena mejor. Supérate."],
        ["/productos", "Suplementación para cada objetivo"],
        ["/productos/2", "Creatina Monohidratada"],
        ["/productos/999", "Producto no encontrado"],
        ["/carrito", "Carrito de compras"],
        ["/login", "Iniciar sesión"],
        ["/registro", "Crear cuenta"],
        ["/contacto", "Hablemos"]
    ])("carga %s con una sola cabecera, un main y un footer", (path, title) => {
        window.history.replaceState({}, "", path);
        render(<App />);

        expect(screen.getAllByRole("banner")).toHaveLength(1);
        expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        expect(within(screen.getByRole("main")).getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
        expect(within(screen.getByRole("banner")).getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();
    });

    it("registra una cuenta desde Login, permite ingresar y vuelve al carrito con la compra intacta", async () => {
        const user = userEvent.setup();
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 2 }]));
        window.history.replaceState({}, "", "/carrito");
        render(<App />);
        await user.click(screen.getByRole("link", { name: "Iniciar sesión", exact: true }));
        await user.click(screen.getByRole("link", { name: "Crear cuenta", exact: true }));
        await fillRegistration(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta", exact: true }));
        expect(screen.getByRole("status")).toHaveTextContent("Usuario registrado correctamente");
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(JSON.parse(localStorage.getItem(USERS_KEY))).toHaveLength(4);
        await user.click(screen.getByRole("link", { name: "Iniciar sesión con mi cuenta" }));
        await user.type(screen.getByRole("textbox", { name: "Correo electrónico" }), registrationData.email);
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { name: "Carrito de compras" })).toBeInTheDocument();
        expect(screen.getByText("Daniela")).toBeInTheDocument();
        expect(screen.getByText("Cliente")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([{ id: 2, quantity: 2 }]);
    });

    it("inicia y cierra sesión desde el carrito sin perder la compra ni la página de origen", async () => {
        const user = userEvent.setup();
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 2 }]));
        window.history.replaceState({}, "", "/carrito");
        render(<App />);

        await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));
        await user.type(screen.getByRole("textbox", { name: "Correo electrónico" }), "camila@gmail.com");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234");
        await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));

        expect(await screen.findByRole("heading", { name: "Carrito de compras" })).toBeInTheDocument();
        expect(window.location.pathname).toBe("/carrito");
        expect(screen.getByText("Camila")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(SESSION_KEY))).toMatchObject({ email: "camila@gmail.com", role: "Cliente" });

        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Creatina Monohidratada" })).toBeInTheDocument();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it("restaura el perfil en la barra al recargar y evita volver al formulario con sesión activa", async () => {
        loginUser("martin@duoc.cl", "1234");
        window.history.replaceState({}, "", "/login");
        render(<App />);

        expect(await screen.findByRole("heading", { name: "Panel de administración" })).toBeInTheDocument();
        const menu = within(screen.getByRole("complementary", { name: "Menú administrativo" }));
        expect(menu.getByText("Martín")).toBeInTheDocument();
        expect(menu.getByText("Vendedor")).toBeInTheDocument();
        expect(screen.queryByRole("form")).not.toBeInTheDocument();
    });

    it.each(["Proteínas", "Creatinas", "Vitaminas", "Pre-entreno"])(
        "abre %s desde el inicio con el catálogo filtrado",
        async category => {
            const user = userEvent.setup();
            render(<App />);

            await user.click(screen.getByRole("link", { name: `Explorar ${category}` }));

            expect(screen.getByRole("heading", { level: 1, name: "Suplementación para cada objetivo" })).toBeInTheDocument();
            expect(screen.getByRole("combobox", { name: /filtrar por categoría/i })).toHaveValue(category);
            expect(new URLSearchParams(window.location.search).get("categoria")).toBe(category);
            expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
        }
    );

    it("agrega un destacado desde el inicio y lo conserva al abrir el carrito", async () => {
        const user = userEvent.setup();
        render(<App />);
        const card = screen.getByRole("heading", { level: 3, name: "Creatina Monohidratada" }).closest("article");

        await user.click(within(card).getByRole("button", { name: "Agregar" }));
        expect(screen.getByRole("status")).toHaveTextContent("Agregaste Creatina Monohidratada al carrito.");
        await user.click(screen.getByRole("link", { name: "Carrito (1)" }));

        expect(screen.getByRole("heading", { name: "Carrito de compras" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Creatina Monohidratada" })).toBeInTheDocument();
        expect(screen.getByLabelText("Cantidad actual")).toHaveTextContent("1");
    });

    it("mantiene el carrito y su contador al navegar entre inicio, catálogo, detalle y carrito", async () => {
        const user = userEvent.setup();
        render(<App />);
        const header = screen.getByRole("banner");

        await user.click(screen.getByRole("link", { name: "Explorar productos" }));
        const productCard = screen.getByRole("heading", { name: "Creatina Monohidratada" }).closest("article");

        await user.click(within(productCard).getByRole("button", { name: "Agregar" }));
        expect(within(header).getByRole("link", { name: "Carrito (1)" })).toBeInTheDocument();

        await user.click(within(productCard).getByRole("link", { name: "Ver detalle" }));
        expect(screen.getByText("KYN002")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
        await user.click(within(header).getByRole("link", { name: "Carrito (2)" }));

        expect(screen.getByRole("heading", { name: "Carrito de compras" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Creatina Monohidratada" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
        expect(within(header).getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
        expect(within(header).getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Eliminar Creatina Monohidratada del carrito" }));
        expect(within(header).getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Tu carrito está vacío" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([]);
        expect(screen.getByRole("banner")).toBe(header);
    });

    it("recupera el carrito al recargar y actualiza el contador al vaciarlo", async () => {
        const user = userEvent.setup();
        localStorage.setItem(CART_KEY, JSON.stringify([{ id: 2, quantity: 3 }]));
        window.history.replaceState({}, "", "/carrito");
        const firstRender = render(<App />);
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();

        firstRender.unmount();
        render(<App />);
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Vaciar carrito" }));
        expect(screen.getByRole("link", { name: "Carrito (0)" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Tu carrito está vacío" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(CART_KEY))).toEqual([]);
    });
});
