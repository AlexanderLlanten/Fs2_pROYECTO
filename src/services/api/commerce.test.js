import { afterEach, describe, it, expect, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { operationKey, commerce } from "./commerce.js";
import { apiSession } from "./session.js";
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); sessionStorage.clear(); });
describe("Operaciones de compra", () => {
    it("reutiliza la clave al reintentar sin guardar la dirección", async () => {
        vi.stubGlobal("crypto", webcrypto);
        const data = { version: 2, delivery: { address: "Dirección privada" } };
        const first = await operationKey("checkout_7", data); expect(await operationKey("checkout_7", data)).toBe(first);
        expect(JSON.stringify(sessionStorage)).not.toContain("Dirección privada");
    });
    it("crea una nueva intención cuando el pedido anterior venció", async () => {
        vi.stubGlobal("crypto", webcrypto);
        const request = vi.spyOn(apiSession, "authorized").mockResolvedValueOnce({ id: 1, status: "EXPIRED" }).mockResolvedValueOnce({ id: 2, status: "PENDING" });
        expect((await commerce.checkout(7, 2, { address: "Calle" })).id).toBe(2);
        expect(request.mock.calls[0][1].body.requestId).not.toBe(request.mock.calls[1][1].body.requestId);
    });
    it("confirma mediante el identificador sin imponer importe ni resultado", async () => {
        const request = vi.spyOn(apiSession, "authorized").mockResolvedValue({ status: "CONFIRMED" });
        await commerce.confirm(3, "payment-id");
        expect(request).toHaveBeenCalledExactlyOnceWith("/orders/3/payments/payment-id/confirm", { method: "POST", body: {} });
    });
    it("no envía una compra si cambia la cuenta mientras prepara la clave", async () => {
        vi.stubGlobal("crypto", webcrypto);
        const request = vi.spyOn(apiSession, "authorized");
        const pending = commerce.checkout(7, 2, { address: "Calle" });
        apiSession.invalidate();
        await expect(pending).rejects.toThrow("La cuenta cambió"); expect(request).not.toHaveBeenCalled();
    });
});
