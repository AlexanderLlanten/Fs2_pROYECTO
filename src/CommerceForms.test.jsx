import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { webcrypto } from "node:crypto";
import PaymentPanel from "./components/organisms/PaymentPanel.jsx";
import OrderStateForm from "./components/organisms/OrderStateForm.jsx";
import DeliveryForm from "./components/organisms/DeliveryForm.jsx";
import { CartContext } from "./context/cartContext.js";
import { apiSession } from "./services/api/session.js";
import { remoteCatalog } from "./services/api/catalogStore.js";
import { ApiError } from "./services/api/client.js";

const order = { id: 3, version: 1, status: "PENDING", payments: [{ id: "attempt", scenario: "APPROVE", status: "PENDING" }] };
const user = { firstName: "Camila", lastName: "Soto", region: "Región Metropolitana de Santiago", commune: "Santiago", address: "Calle de prueba 123" };
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); sessionStorage.clear(); });
function payment({ value = order, enabled = true, failure } = {}) {
    const reload = vi.fn().mockResolvedValue(); const changed = vi.fn();
    vi.spyOn(remoteCatalog, "reload").mockResolvedValue();
    const request = vi.spyOn(apiSession, "authorized").mockImplementation(async path => {
        if (path === "/payment-options") return { enabled, scenarios: ["APPROVE", "REJECT"] };
        if (failure) throw failure;
        return { ...order, status: "CONFIRMED" };
    });
    render(<CartContext.Provider value={{ reloadCart: reload }}><PaymentPanel order={value} onChange={changed} /></CartContext.Provider>);
    return { request, reload, changed };
}
describe("Formularios de compra", () => {
    it("identifica el entorno simulado y confirma sin solicitar datos bancarios", async () => {
        const { changed, reload, request } = payment();
        const button = await screen.findByRole("button", { name: "Confirmar pago de prueba" });
        expect(screen.getByText(/No se realizan cobros reales/)).toBeInTheDocument();
        await userEvent.click(button);
        expect(changed).toHaveBeenCalledWith(expect.objectContaining({ status: "CONFIRMED" }));
        expect(reload).toHaveBeenCalled();
        expect(request).toHaveBeenCalledWith("/orders/3/payments/attempt/confirm", { method: "POST", body: {} });
    });
    it("no confirma visualmente un pago que falla por falta de stock", async () => {
        const { changed, reload } = payment({ failure: new ApiError("Stock insuficiente", 409) });
        await userEvent.click(await screen.findByRole("button", { name: "Confirmar pago de prueba" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("Stock insuficiente");
        expect(changed).not.toHaveBeenCalled(); expect(reload).not.toHaveBeenCalled();
    });
    it("bloquea los pagos si el servidor no habilitó el emulador", async () => {
        const { request } = payment({ enabled: false });
        expect(await screen.findByRole("alert")).toHaveTextContent("no está habilitado");
        expect(screen.queryByRole("button", { name: "Confirmar pago de prueba" })).not.toBeInTheDocument();
        expect(request).toHaveBeenCalledTimes(1);
    });
    it("prepara el escenario seleccionado con una clave de reintento", async () => {
        vi.stubGlobal("crypto", webcrypto);
        const { request } = payment({ value: { ...order, payments: [] } });
        const choices = await screen.findByRole("combobox", { name: "Escenario de prueba" });
        await userEvent.selectOptions(choices, "REJECT");
        await userEvent.click(screen.getByRole("button", { name: "Preparar pago de prueba" }));
        expect(request).toHaveBeenCalledWith("/orders/3/payments", expect.objectContaining({ body: { requestId: expect.any(String), scenario: "REJECT" } }));
    });
    it("exige motivo y versión para anular y explica la reversión de prueba", async () => {
        const request = vi.spyOn(apiSession, "authorized").mockResolvedValue({ ...order, status: "CANCELLED" });
        const changed = vi.fn(); render(<OrderStateForm order={{ ...order, status: "CONFIRMED" }} onChange={changed} />);
        await userEvent.selectOptions(screen.getByRole("combobox", { name: "Nuevo estado" }), "CANCELLED");
        expect(screen.getByRole("button", { name: "Anular pedido" })).toBeDisabled();
        expect(screen.getByText(/No representa un reembolso real/)).toBeInTheDocument();
        await userEvent.type(screen.getByRole("textbox", { name: "Motivo" }), "Solicitud de prueba");
        await userEvent.click(screen.getByRole("button", { name: "Anular pedido" }));
        expect(request).toHaveBeenCalledWith("/admin/orders/3/status", { method: "PUT", body: { version: 1, status: "CANCELLED", reason: "Solicitud de prueba" } });
        expect(changed).toHaveBeenCalledWith(expect.objectContaining({ status: "CANCELLED" }));
    });
    it("usa el perfil como dirección inicial y entrega valores normalizados", async () => {
        const submit = vi.fn().mockResolvedValue(); render(<DeliveryForm user={user} onSubmit={submit} />);
        expect(screen.getByRole("textbox", { name: "Dirección", exact: true })).toHaveValue(user.address);
        await userEvent.click(screen.getByRole("button", { name: "Crear pedido y revisar pago" }));
        expect(submit).toHaveBeenCalledExactlyOnceWith({ recipient: "Camila Soto", region: user.region, commune: user.commune, address: user.address });
    });
});
