import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import AuthProvider from "../../context/AuthContext.jsx";
import { loginUser, SESSION_KEY } from "../../services/auth.js";
import AccountActions from "./AccountActions.jsx";

function LocationSnapshot() {
    const { pathname, state } = useLocation();
    return <output aria-label="Navegación actual">{pathname} {JSON.stringify(state?.from)}</output>;
}

function renderActions(onNavigate) {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/productos?categoria=Vitaminas"]}>
                <AccountActions onNavigate={onNavigate} />
                <LocationSnapshot />
            </MemoryRouter>
        </AuthProvider>
    );
}

describe("AccountActions", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it.each([["camila@gmail.com", false], ["martin@duoc.cl", true], ["admin@profesor.duoc.cl", true]])(
        "ofrece Administración según el permiso de %s", (email, allowed) => {
            loginUser(email, "1234");
            renderActions();
            const link = screen.queryByRole("link", { name: "Administración" });
            if (allowed) expect(link).toHaveAttribute("href", "/admin");
            else expect(link).not.toBeInTheDocument();
        }
    );

    it("lleva al login conservando la página de origen y sus filtros", async () => {
        const user = userEvent.setup();
        renderActions();

        await user.click(screen.getByRole("link", { name: "Iniciar sesión" }));

        expect(screen.getByLabelText("Navegación actual")).toHaveTextContent('/login {"pathname":"/productos","search":"?categoria=Vitaminas"}');
        expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument();
    });

    it("muestra el nombre y rol y permite cerrar la sesión desde la navegación", async () => {
        loginUser("camila@gmail.com", "1234");
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        renderActions(onNavigate);
        expect(screen.getByText("Camila")).toBeInTheDocument();
        expect(screen.getByText("Cliente")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

        expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it("explica un cierre fallido y conserva la sesión para permitir reintentar", async () => {
        loginUser("camila@gmail.com", "1234");
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        renderActions(onNavigate);
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
            throw new DOMException("Almacenamiento bloqueado", "SecurityError");
        });

        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

        expect(screen.getByRole("alert")).toHaveTextContent(/almacenamiento/i);
        expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
        expect(onNavigate).not.toHaveBeenCalled();
    });
});
