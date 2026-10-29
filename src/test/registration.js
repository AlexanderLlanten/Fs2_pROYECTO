/*
 * Preparación compartida de pruebas.
 * Comparte valores y operaciones auxiliares de pruebas de registro.
 */

import { screen } from "@testing-library/react";

export const registrationData = {
    run: "98765433",
    firstName: "Daniela",
    lastName: "Muñoz Soto",
    email: "daniela@gmail.com",
    birthDate: null,
    region: "Región Metropolitana de Santiago",
    commune: "Santiago",
    address: "Avenida Central 123"
};

// Ayudante de pruebas que completa los datos de registro y sus selectores dependientes.
export async function fillRegistration(user, values = registrationData) {
    for (const [label, key] of [["RUN", "run"], ["Nombre", "firstName"], ["Apellidos", "lastName"],
        ["Correo electrónico", "email"], ["Dirección", "address"]]) {
        // Los recorridos necesitan datos válidos; la escritura tecla a tecla se prueba
        // en los casos de validación. Pegar conserva los eventos reales de entrada.
        await user.click(screen.getByRole("textbox", { name: label, exact: true }));
        await user.paste(values[key]);
    }
    await user.selectOptions(screen.getByRole("combobox", { name: "Región" }), values.region);
    await user.selectOptions(screen.getByRole("combobox", { name: "Comuna" }), values.commune);
}
