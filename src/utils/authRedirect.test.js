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
