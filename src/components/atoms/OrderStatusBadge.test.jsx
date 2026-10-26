import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderStatusBadge from "./OrderStatusBadge.jsx";

describe("OrderStatusBadge", () => {
    it.each([["Pendiente", "pending"], ["Preparación", "preparation"], ["Despachado", "shipped"], ["Otro", "default"]])("identifica %s con texto y estilo", (status, modifier) => {
        render(<OrderStatusBadge status={status} />);
        expect(screen.getByText(status)).toHaveClass("kynex-badge", `kynex-order-status--${modifier}`);
    });
});
