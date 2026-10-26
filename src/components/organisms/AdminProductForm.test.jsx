import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { products } from "../../data/products.js";
import { fillProduct, productData } from "../../test/product.js";
import AdminProductForm from "./AdminProductForm.jsx";

function renderForm(props = {}) { render(<MemoryRouter><AdminProductForm onSubmit={vi.fn()} {...props} /></MemoryRouter>); }

describe("AdminProductForm", () => {
    it("bloquea datos vacíos y enfoca el primer error asociado", async () => {
        const user = userEvent.setup(); const onSubmit = vi.fn(); renderForm({ onSubmit });
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByRole("textbox", { name: "Código" })).toHaveFocus();
        expect(screen.getByRole("textbox", { name: "Código" })).toHaveAccessibleDescription(/al menos 3/);
        expect(screen.getByRole("alert")).toHaveTextContent("Revisa los campos");
    });
    it("envía datos normalizados y un umbral vacío como null", async () => {
        const user = userEvent.setup(); const onSubmit = vi.fn().mockResolvedValue({ success: true }); renderForm({ onSubmit });
        await fillProduct(user);
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(productData);
        expect(screen.getByRole("textbox", { name: "Descripción" })).toHaveAccessibleDescription(/21 \/ 500/);
    });
    it("precarga y avisa de stock crítico incluyendo el umbral cero", async () => {
        const user = userEvent.setup(); renderForm({ initialProduct: { ...products[0], stock: 0, criticalStock: 0 } });
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue(products[0].name);
        expect(screen.getByRole("status")).toHaveTextContent("Stock crítico");
        await user.clear(screen.getByRole("spinbutton", { name: "Stock crítico" }));
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    it("valida al salir y retira el error al corregir con el teclado", async () => {
        const user = userEvent.setup(); renderForm();
        const code = screen.getByRole("textbox", { name: "Código" });
        await user.type(code, "AA"); await user.tab();
        expect(code).toHaveAttribute("aria-invalid", "true");
        await user.type(code, "7");
        expect(code).not.toHaveAttribute("aria-invalid");
    });
    it("conserva los valores y enfoca el duplicado indicado por el servicio", async () => {
        const user = userEvent.setup(); renderForm({ initialProduct: products[0], onSubmit: vi.fn().mockResolvedValue({ success: false, errors: { code: "Código duplicado." }, message: "Revisa el código." }) });
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("Revisa el código");
        expect(screen.getByRole("textbox", { name: "Código" })).toHaveFocus();
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue(products[0].name);
    });
    it("evita envíos repetidos durante la espera y recupera el formulario al fallar", async () => {
        const user = userEvent.setup(); let resolveSave;
        const onSubmit = vi.fn(() => new Promise(resolve => { resolveSave = resolve; }));
        renderForm({ initialProduct: products[0], onSubmit });
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        const pending = screen.getByRole("button", { name: "Guardando…" });
        expect(pending).toBeDisabled(); await user.click(pending); expect(onSubmit).toHaveBeenCalledOnce();
        await act(async () => resolveSave({ success: false }));
        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible guardar");
        expect(screen.getByRole("button", { name: "Guardar producto" })).toBeEnabled();
    });
    it("informa una excepción del consumidor y permite reintentar", async () => {
        const user = userEvent.setup(); renderForm({ initialProduct: products[0], onSubmit: vi.fn().mockRejectedValue(new Error("Fallo")) });
        await user.click(screen.getByRole("button", { name: "Guardar producto" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("No fue posible guardar el producto");
    });
});
