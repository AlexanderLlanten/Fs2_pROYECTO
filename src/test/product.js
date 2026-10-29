/*
 * Preparación compartida de pruebas.
 * Comparte datos y operaciones auxiliares de pruebas de producto.
 */

import { screen } from "@testing-library/react";

export const productData = { code: "KYN007", category: "Aminoácidos", name: "Producto de prueba", description: "Descripción de prueba", price: 10000, stock: 10, criticalStock: null, image: "" };

// Ayudante de pruebas que completa el formulario de producto.
export async function fillProduct(user) {
    for (const [label, value] of [["Código", productData.code], ["Nombre", productData.name], ["Descripción", productData.description]]) {
        await user.click(screen.getByRole("textbox", { name: label, exact: true }));
        await user.paste(value);
    }
    await user.selectOptions(screen.getByRole("combobox", { name: "Categoría" }), productData.category);
    await user.type(screen.getByRole("spinbutton", { name: "Precio" }), String(productData.price));
    await user.type(screen.getByRole("spinbutton", { name: "Stock", exact: true }), String(productData.stock));
}
