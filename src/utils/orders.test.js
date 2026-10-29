/*
 * Pruebas automatizadas.
 * Pruebas de orders. Casos: «resume una lista vacía y admite productos gratuitos sin agregar
 * despacho»; «exige un identificador entero positivo completo».
 */

import { describe, expect, it } from "vitest";
import { orders } from "../data/orders.js";
import { calculateOrderSummary, parseOrderId } from "./orders.js";

describe("Cálculos de pedidos", () => {
    it.each([[1001, 2, 61980], [1002, 2, 69980], [1003, 2, 42980]])("conserva unidades y total de productos del pedido %s", (id, quantity, total) => {
        expect(calculateOrderSummary(orders.find(order => order.id === id))).toEqual({ quantity, total });
    });
    it("resume una lista vacía y admite productos gratuitos sin agregar despacho", () => {
        expect(calculateOrderSummary()).toEqual({ quantity: 0, total: 0 });
        expect(calculateOrderSummary({ products: [] })).toEqual({ quantity: 0, total: 0 });
        expect(calculateOrderSummary({ products: [{ price: 0, quantity: 3 }] })).toEqual({ quantity: 3, total: 0 });
    });
    it("exige un identificador entero positivo completo", () => {
        expect(parseOrderId("1001")).toBe(1001);
        for (const value of ["1001abc", "1e3", "1.5", "", "-1", 0, null, undefined, "9007199254740992"]) expect(parseOrderId(value)).toBeNull();
    });
});
