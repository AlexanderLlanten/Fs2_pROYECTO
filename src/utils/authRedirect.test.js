import { describe, expect, it } from "vitest";

import { getLoginDestination } from "./authRedirect.js";

describe("Destino posterior al acceso", () => {
    it.each(["/", "/carrito", "/productos", "/productos/2"])("permite volver a %s", pathname => {
        expect(getLoginDestination({ pathname })).toBe(pathname);
    });

    it("conserva los filtros del catálogo", () => {
        expect(getLoginDestination({ pathname: "/productos", search: "?categoria=Prote%C3%ADnas" }))
            .toBe("/productos?categoria=Prote%C3%ADnas");
    });

    it.each(["Administrador", "Vendedor"])("envía %s al panel o al origen público explícito", role => {
        expect(getLoginDestination(undefined, role)).toBe("/admin");
        expect(getLoginDestination({ pathname: "/admin", search: "?vista=resumen" }, role)).toBe("/admin?vista=resumen");
        expect(getLoginDestination({ pathname: "/productos", search: "?categoria=Vitaminas" }, role)).toBe("/productos?categoria=Vitaminas");
        for (const pathname of ["https://ejemplo.com", "//ejemplo.com", "/login", "/registro", "/admin/desconocido"]) {
            expect(getLoginDestination({ pathname }, role)).toBe("/admin");
        }
    });

    it.each(["/admin/usuarios", "/admin/usuarios/nuevo", "/admin/usuarios/1/editar"])("retorna a %s solo con permiso de usuarios", pathname => {
        expect(getLoginDestination({ pathname, search: "?origen=panel" }, "Administrador")).toBe(`${pathname}?origen=panel`);
        expect(getLoginDestination({ pathname }, "Vendedor")).toBe("/admin");
        expect(getLoginDestination({ pathname }, "Cliente")).toBe("/productos");
    });

    it("impide retornar al panel con un perfil Cliente o desconocido", () => {
        for (const role of ["Cliente", "Otro", undefined]) {
            expect(getLoginDestination({ pathname: "/admin" }, role)).toBe("/productos");
        }
    });

    it.each(["https://ejemplo.com", "//ejemplo.com", "/login", "/admin", "/no-existe", "/\\ejemplo.com"])(
        "usa el catálogo en lugar de un destino externo, circular o inexistente: %s",
        pathname => expect(getLoginDestination({ pathname })).toBe("/productos")
    );

    it("tolera un estado de navegación ausente o mal formado", () => {
        expect(getLoginDestination(undefined)).toBe("/productos");
        expect(getLoginDestination("/carrito")).toBe("/productos");
        expect(getLoginDestination({ pathname: "/productos", search: "no-es-query" })).toBe("/productos");
    });
});
