import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { orders } from "../../data/orders.js";
import OrderItemsTable from "./OrderItemsTable.jsx";

describe("OrderItemsTable", () => {
    it("distingue precio unitario, cantidad y total de una línea con varias unidades", () => {
        render(<OrderItemsTable products={orders[1].products} />);
        const row = screen.getByRole("row", { name: /Plant Protein Vegan/ });
        expect(within(row).getAllByRole("cell").map(cell => cell.textContent)).toEqual(["$34.990", "2", "$69.980"]);
        expect(screen.getByRole("columnheader", { name: "Precio unitario" })).toBeInTheDocument();
    });
    it("informa un pedido sin productos", () => {
        render(<OrderItemsTable products={[]} />);
        expect(screen.getByRole("status")).toHaveTextContent("no contiene productos");
    });
});
