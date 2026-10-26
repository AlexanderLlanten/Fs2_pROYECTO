import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { loginUser } from "./services/auth.js";
import { PRODUCTS_KEY } from "./services/productStore.js";
import { CART_KEY } from "./utils/cart.js";
import { ROUTINE_KEY } from "./services/routineStore.js";

function openPage(path = "/") { window.history.replaceState({}, "", path); return render(<App />); }
function savedData() { return Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])); }

describe("Paridad de Inicio y continuación de compra", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });

    it.each([undefined, "camila@gmail.com", "martin@duoc.cl", "admin@profesor.duoc.cl"])("mantiene los bloques públicos y los datos guardados con el perfil %s", email => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]');
        localStorage.setItem(ROUTINE_KEY, '[{"id":1,"sets":5,"reps":10}]');
        if (email) loginUser(email, "1234");
        const view = openPage(); const before = savedData();
        expect(screen.getAllByRole("banner")).toHaveLength(1);
        expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        for (const name of ["Todo lo necesario para avanzar", "¿Qué quieres conseguir?", "Del suplemento al entrenamiento", "Contenido audiovisual", "Aprende más", "Construye tu próximo nivel"]) {
            expect(screen.getByRole("region", { name, exact: true })).toBeInTheDocument();
        }
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        view.unmount(); openPage(); expect(savedData()).toEqual(before);
    });

    it.each([
        ["Ver entrenamientos", "/entrenamiento", "Entrenamiento"],
        ["Conocer KYNEX", "/nosotros", "Nuestra tienda"],
        ["Mi rutina", "/rutina", "Mi rutina"],
        ["Leer artículo: Creatina y rendimiento", "/blog/creatina-y-rendimiento", "Creatina y rendimiento"],
        ["Leer artículo: Recuperación muscular", "/blog/recuperacion-muscular", "Recuperación muscular"],
        ["Ver todos los artículos", "/blog", "Blog"],
        ["Crear cuenta", "/registro", "Crear cuenta"]
    ])("abre %s mediante React Router y permite volver a Inicio", async (link, path, heading) => {
        const user = userEvent.setup(); openPage(); const header = screen.getByRole("banner");
        await user.click(within(screen.getByRole("main")).getByRole("link", { name: link, exact: true }));
        expect(window.location.pathname).toBe(path);
        expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
        expect(screen.getByRole("banner")).toBe(header);
        await user.click(within(header).getByRole("link", { name: "Inicio", exact: true }));
        expect(screen.getByRole("heading", { level: 1, name: "Entrena mejor. Supérate." })).toBeInTheDocument();
    });

    it.each(["Aumento de masa", "Energía", "Recuperación", "Descanso"])("abre el catálogo completo desde el objetivo %s", async name => {
        const user = userEvent.setup(); openPage();
        await user.click(screen.getByRole("link", { name, exact: true }));
        expect(window.location.pathname + window.location.search).toBe("/productos");
        expect(screen.getByRole("combobox", { name: /filtrar por categoría/i })).toHaveValue("all");
        expect(screen.getAllByRole("article")).toHaveLength(6);
    });

    it.each(["[]", "datos dañados"])("conserva los bloques informativos cuando el catálogo contiene %s", raw => {
        localStorage.setItem(PRODUCTS_KEY, raw); openPage();
        expect(screen.queryByRole("region", { name: "Productos destacados" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Ver destacados" })).not.toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Aprende más", exact: true })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Ver entrenamientos" })).toBeInTheDocument();
        expect(localStorage.getItem(PRODUCTS_KEY)).toBe(raw);
    });

    it("muestra el aviso sin enviar solicitudes, generar pedidos ni modificar compra, sesión o rutina", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]');
        localStorage.setItem(ROUTINE_KEY, '[{"id":1,"sets":5,"reps":10}]');
        loginUser("camila@gmail.com", "1234");
        const user = userEvent.setup(); openPage("/carrito"); const before = savedData();
        const fetchRequest = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("No debe enviar solicitudes"));
        const write = vi.spyOn(Storage.prototype, "setItem");
        await user.click(screen.getByRole("button", { name: "Continuar compra" }));
        expect(within(screen.getByRole("complementary")).getByRole("status")).toHaveTextContent("El proceso de checkout será implementado en una etapa posterior.");
        expect(window.location.pathname).toBe("/carrito");
        expect(screen.getByRole("link", { name: "Carrito (2)" })).toBeInTheDocument();
        expect(savedData()).toEqual(before); expect(write).not.toHaveBeenCalled(); expect(fetchRequest).not.toHaveBeenCalled();
        await user.click(screen.getByRole("link", { name: "Seguir comprando" }));
        await user.click(screen.getByRole("link", { name: "Carrito (2)" }));
        expect(within(screen.getByRole("complementary")).getByRole("status")).toBeEmptyDOMElement();
        expect(savedData()).toEqual(before);
    });
});
