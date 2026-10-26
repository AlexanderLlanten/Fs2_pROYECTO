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

export async function fillRegistration(user, values = registrationData) {
    for (const [label, key] of [["RUN", "run"], ["Nombre", "firstName"], ["Apellidos", "lastName"],
        ["Correo electrónico", "email"], ["Dirección", "address"]]) {
        await user.type(screen.getByRole("textbox", { name: label, exact: true }), values[key]);
    }
    await user.selectOptions(screen.getByRole("combobox", { name: "Región" }), values.region);
    await user.selectOptions(screen.getByRole("combobox", { name: "Comuna" }), values.commune);
}
