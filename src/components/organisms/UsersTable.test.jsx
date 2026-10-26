import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { defaultUsers } from "../../data/users.js";
import UsersTable from "./UsersTable.jsx";

describe("UsersTable", () => {
    it("muestra el estado vacío", () => {
        render(<MemoryRouter><UsersTable users={[]} /></MemoryRouter>);
        expect(screen.getByRole("status")).toHaveTextContent("No hay usuarios registrados.");
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
    it("renderiza texto de usuarios como texto y entrega el registro al solicitar eliminar", async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        const account = { ...defaultUsers[0], firstName: "<img src=x onerror=alert(1)>" };
        const { container } = render(<MemoryRouter><UsersTable users={[account]} currentUserId={3} onDelete={onDelete} /></MemoryRouter>);
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByRole("rowheader")).toHaveTextContent(account.firstName);
        await user.click(screen.getByRole("button", { name: /^Eliminar a/ }));
        expect(onDelete).toHaveBeenCalledExactlyOnceWith(account);
    });
});
