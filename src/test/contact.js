import { screen } from "@testing-library/react";

export const contactData = { name: "Daniela Muñoz", email: "daniela@gmail.com", comment: "Consulta sobre productos." };

export async function fillContact(user, values = contactData) {
    for (const [label, key] of [["Nombre", "name"], ["Correo electrónico", "email"], ["Comentario", "comment"]]) {
        await user.click(screen.getByRole("textbox", { name: label, exact: true }));
        await user.paste(values[key]);
    }
}
