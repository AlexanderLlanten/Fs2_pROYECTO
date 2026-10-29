/*
 * Pruebas automatizadas.
 * Pruebas de contact. Casos: «exige los tres campos y rechaza contenido vacío o solo espacios»;
 * «acepta un nombre de 100 caracteres y rechaza uno de 101».
 */

import { describe, expect, it } from "vitest";
import { getContactErrors } from "./contact.js";

const valid = { name: "Daniela Muñoz", email: "daniela@gmail.com", comment: "Consulta sobre productos." };

describe("Validaciones de Contacto", () => {
    it("exige los tres campos y rechaza contenido vacío o solo espacios", () => {
        expect(getContactErrors()).toEqual({ name: "El nombre es obligatorio.", email: "El correo electrónico es obligatorio.", comment: "El comentario es obligatorio." });
        expect(getContactErrors({ name: "   ", email: " ", comment: "\n " })).toEqual(getContactErrors());
    });
    it("acepta un nombre de 100 caracteres y rechaza uno de 101", () => {
        expect(getContactErrors({ ...valid, name: "a".repeat(100) }).name).toBe("");
        expect(getContactErrors({ ...valid, name: "a".repeat(101) }).name).toContain("100 caracteres");
    });
    it("acepta un comentario de 500 caracteres y rechaza uno de 501", () => {
        expect(getContactErrors({ ...valid, comment: "a".repeat(500) }).comment).toBe("");
        expect(getContactErrors({ ...valid, comment: "a".repeat(501) }).comment).toContain("500 caracteres");
    });
    it("reutiliza los dominios permitidos y rechaza otros correos", () => {
        for (const email of ["daniela@duoc.cl", "daniela@profesor.duoc.cl", "daniela@gmail.com"]) expect(getContactErrors({ ...valid, email }).email).toBe("");
        for (const email of ["daniela@example.com", "sin-arroba", "daniela@gmail.com.otro"]) expect(getContactErrors({ ...valid, email }).email).toContain("Utiliza un correo");
    });
    it("aplica el límite de 100 caracteres al correo", () => {
        expect(getContactErrors({ ...valid, email: `${"a".repeat(90)}@gmail.com` }).email).toBe("");
        expect(getContactErrors({ ...valid, email: `${"a".repeat(91)}@gmail.com` }).email).toContain("100 caracteres");
    });
    it("admite espacios exteriores y mayúsculas sin modificar los datos recibidos", () => {
        const values = { name: " Daniela ", email: " DANIELA@GMAIL.COM ", comment: " Consulta. " };
        expect(getContactErrors(values)).toEqual({ name: "", email: "", comment: "" });
        expect(values.email).toBe(" DANIELA@GMAIL.COM ");
    });
});
