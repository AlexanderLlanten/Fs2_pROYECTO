/*
 * Pruebas automatizadas.
 * Pruebas de ProductsTable. Casos: «permite consultar a Vendedor sin ofrecer modificaciones»; «ofrece
 * edición y solicita confirmación mediante el callback al Administrador».
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { products } from "../../data/products.js";
import ProductsTable from "./ProductsTable.jsx";

describe("ProductsTable", () => {
    it("permite consultar a Vendedor sin ofrecer modificaciones", () => {
        render(<MemoryRouter><ProductsTable products={[{ ...products[0], stock: 1, criticalStock: 1 }]} canManage={false} /></MemoryRouter>);
        expect(screen.getByRole("table", { name: "Productos registrados en KYNEX" })).toHaveTextContent("Stock crítico");
        expect(screen.getByRole("link", { name: `Ver ${products[0].name}` })).toHaveAttribute("href", "/productos/1");
        expect(screen.queryByRole("link", { name: /Editar/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();
    });
    it("ofrece edición y solicita confirmación mediante el callback al Administrador", async () => {
        const user = userEvent.setup(); const onDelete = vi.fn();
        render(<MemoryRouter><ProductsTable products={[products[0]]} canManage onDelete={onDelete} /></MemoryRouter>);
        expect(screen.getByRole("link", { name: `Editar ${products[0].name}` })).toHaveAttribute("href", "/admin/productos/1/editar");
        await user.click(screen.getByRole("button", { name: `Eliminar ${products[0].name}` }));
        expect(onDelete).toHaveBeenCalledExactlyOnceWith(products[0]);
    });
    it("informa un catálogo vacío", () => {
        render(<ProductsTable products={[]} />);
        expect(screen.getByRole("status")).toHaveTextContent("No hay productos registrados");
    });
});
