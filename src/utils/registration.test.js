/*
 * Pruebas automatizadas.
 * Pruebas de registration. Casos: «normaliza los datos sin admitir rol ni contraseña desde el
 * formulario»; «valida campos requeridos y los límites de nombre, apellidos y dirección».
 */

import { describe, expect, it } from "vitest";
import { registrationData } from "../test/registration.js";
import { cleanRun, getRunError } from "./validation.js";
import { getRegistrationErrors, normalizeRegistration } from "./registration.js";

describe("Validaciones del registro EP1", () => {
    it.each(["9.876.543-3", "12.345.678-5", "6.000.000-k", "10.000.004-0"])("acepta el RUN %s por módulo 11", run => {
        expect(getRunError(run)).toBe("");
    });

    it.each(["98765432", "abcdefghi", "12", "1234567890", "12 3456785", ""])("rechaza RUN inválido: %s", run => {
        expect(getRunError(run)).not.toBe("");
    });

    it("normaliza los datos sin admitir rol ni contraseña desde el formulario", () => {
        expect(normalizeRegistration({ ...registrationData, run: " 9.876.543-3 ",
            email: " DANIELA@GMAIL.COM ", firstName: " Daniela ", role: "Administrador", password: "otra" }))
            .toEqual(registrationData);
        expect(cleanRun(null)).toBe("");
        expect(getRegistrationErrors(null).run).toContain("obligatorio");
    });

    it("valida campos requeridos y los límites de nombre, apellidos y dirección", () => {
        const empty = getRegistrationErrors();
        for (const field of ["run", "firstName", "lastName", "email", "region", "commune", "address"]) {
            expect(empty[field]).not.toBe("");
        }
        const boundary = { ...registrationData, firstName: "a".repeat(50), lastName: "a".repeat(100), address: "a".repeat(300) };
        expect(Object.values(getRegistrationErrors(boundary)).every(value => value === "")).toBe(true);
        const over = getRegistrationErrors({ ...boundary, firstName: `${boundary.firstName}a`, lastName: `${boundary.lastName}a`, address: `${boundary.address}a` });
        expect(over.firstName).toContain("50");
        expect(over.lastName).toContain("100");
        expect(over.address).toContain("300");
    });

    it("exige que la comuna pertenezca a una región disponible", () => {
        expect(getRegistrationErrors({ ...registrationData, commune: "Valparaíso" }).commune).not.toBe("");
        expect(getRegistrationErrors({ ...registrationData, region: "Desconocida" }).region).not.toBe("");
    });

    it("acepta fecha opcional o de calendario válida y rechaza fechas imposibles", () => {
        expect(getRegistrationErrors(registrationData).birthDate).toBe("");
        expect(getRegistrationErrors({ ...registrationData, birthDate: "2000-02-29" }).birthDate).toBe("");
        for (const birthDate of ["2001-02-29", "ayer", "2024-13-01"]) {
            expect(getRegistrationErrors({ ...registrationData, birthDate }).birthDate).not.toBe("");
        }
    });
});
