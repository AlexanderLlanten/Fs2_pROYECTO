import { afterEach, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.hoisted(() => vi.stubEnv("VITE_DATA_SOURCE", "api"));
vi.mock("../hooks/useCatalog.js", () => ({ default: () => ({ success: true, products: [] }) }));
import { AuthContext } from "./authContext.js";
import CartProvider from "./CartContext.jsx";
import ContactForm from "../components/organisms/ContactForm.jsx";
afterEach(() => { vi.unstubAllEnvs(); localStorage.clear(); });

it("conserva el formulario público al resolver una sesión de visitante y no concilia el carrito durante la espera", async () => {
    const stored = '[{"id":2,"quantity":3}]'; localStorage.setItem("kynex_cart", stored);
    const view = loading => <AuthContext.Provider value={{ user: null, isLoading: loading }}><CartProvider><ContactForm /></CartProvider></AuthContext.Provider>;
    const { rerender } = render(view(true)); await userEvent.type(screen.getByRole("textbox", { name: "Nombre", exact: true }), "Borrador conservado");
    expect(localStorage.getItem("kynex_cart")).toBe(stored); rerender(view(false));
    expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue("Borrador conservado");
});
