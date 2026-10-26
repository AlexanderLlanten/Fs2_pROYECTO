import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { orders } from "../../data/orders.js";
import { calculateOrderSummary } from "../../utils/orders.js";
import OrdersTable from "./OrdersTable.jsx";

describe("OrdersTable", () => {
    it("asocia pedido, cliente, fecha, unidades e importes y enlaza su detalle", () => {
        render(<MemoryRouter><OrdersTable orders={orders.map(order => ({ ...order, ...calculateOrderSummary(order) }))} /></MemoryRouter>);
        const table = screen.getByRole("table", { name: "Pedidos registrados en KYNEX" });
        expect(within(table).getAllByRole("row")).toHaveLength(4);
        const row = within(table).getByRole("row", { name: /#1002/ });
        expect(row).toHaveTextContent("Diego Martínez"); expect(row).toHaveTextContent("diego@gmail.com");
        expect(within(row).getByText("2")).toBeInTheDocument(); expect(row).toHaveTextContent("$69.980");
        expect(within(row).getByText("2026-09-29")).toHaveAttribute("datetime", "2026-09-29");
        expect(within(row).getByRole("link", { name: "Ver pedido 1002" })).toHaveAttribute("href", "/admin/pedidos/1002");
    });
    it("informa una lista vacía sin crear enlaces ficticios", () => {
        render(<OrdersTable orders={[]} />);
        expect(screen.getByRole("status")).toHaveTextContent("No hay pedidos disponibles");
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
});
