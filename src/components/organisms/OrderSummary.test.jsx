/*
 * Pruebas automatizadas.
 * Pruebas de OrderSummary. Casos: «muestra cliente, estado, fecha e importe del pedido registrado».
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { orders } from "../../data/orders.js";
import { calculateOrderSummary } from "../../utils/orders.js";
import OrderSummary from "./OrderSummary.jsx";

describe("OrderSummary", () => {
    it("muestra cliente, estado, fecha e importe del pedido registrado", () => {
        render(<OrderSummary order={{ ...orders[2], ...calculateOrderSummary(orders[2]) }} />);
        expect(screen.getByRole("region", { name: "Resumen del pedido" })).toBeInTheDocument();
        expect(screen.getByText("Fernanda López")).toBeInTheDocument();
        expect(screen.getByText("fernanda@duoc.cl")).toBeInTheDocument();
        expect(screen.getByText("Pendiente")).toBeInTheDocument();
        expect(screen.getByText("2026-09-30")).toHaveAttribute("datetime", "2026-09-30");
        expect(screen.getByText("$42.980")).toBeInTheDocument();
    });
});
