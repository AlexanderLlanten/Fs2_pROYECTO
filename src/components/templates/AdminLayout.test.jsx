import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "../../context/AuthContext.jsx";
import { loginUser } from "../../services/auth.js";
import AdminLayout from "./AdminLayout.jsx";

function renderLayout() {
    render(<AuthProvider><MemoryRouter initialEntries={["/admin"]}>
        <Routes>
            <Route path="/admin" element={<AdminLayout />}><Route index element={<h1>Contenido administrativo</h1>} /></Route>
            <Route path="/productos" element={<h1>Tienda</h1>} />
        </Routes>
    </MemoryRouter></AuthProvider>);
}

describe("AdminLayout", () => {
    beforeEach(() => { localStorage.clear(); loginUser("admin@profesor.duoc.cl", "1234"); });

    it("compone el perfil, navegación, un main y un footer reutilizables", () => {
        renderLayout();
        expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
        expect(screen.getByRole("main")).toHaveAttribute("id", "admin-main-content");
        expect(screen.getByRole("link", { name: "Saltar al contenido principal" })).toHaveAttribute("href", "#admin-main-content");
        expect(screen.getByRole("link", { name: "Panel principal" })).toHaveAttribute("aria-current", "page");
        expect(screen.getAllByText("Administrador")).toHaveLength(2);
        expect(screen.queryByRole("link", { name: "Administración" })).not.toBeInTheDocument();
    });

    it("controla el menú móvil con React y permite regresar a la tienda", async () => {
        const user = userEvent.setup();
        renderLayout();
        const toggle = screen.getByRole("button", { name: "Abrir menú administrativo" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        await user.click(toggle);
        expect(screen.getByRole("button", { name: "Cerrar menú administrativo" })).toHaveAttribute("aria-expanded", "true");
        await user.click(screen.getByRole("button", { name: "Cerrar menú administrativo" }));
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        await user.click(screen.getByRole("link", { name: "Volver a la tienda" }));
        expect(screen.getByRole("heading", { name: "Tienda" })).toBeInTheDocument();
    });
});
