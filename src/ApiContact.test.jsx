import { beforeEach, afterEach, afterAll, describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.hoisted(() => vi.stubEnv("VITE_DATA_SOURCE", "api"));
import App from "./App.jsx";
import { apiSession } from "./services/api/session.js";
import { remoteCatalog } from "./services/api/catalogStore.js";
import { fillContact, contactData } from "./test/contact.js";

const original = { id: 1, name: "Daniela Muñoz", email: "daniela@gmail.com", comment: "Consulta original <script>texto</script>",
    status: "PENDIENTE", note: "", version: 0, createdAt: "2026-11-15T01:00:00Z", updatedAt: "2026-11-15T01:00:00Z", history: [] };
let messages, calls, role, conflict, offline, failAfterReceipt, hold, receipts, validation;
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => structuredClone(data) });
beforeEach(async () => {
    messages = [structuredClone(original)]; calls = []; role = "Administrador"; conflict = false; offline = false;
    failAfterReceipt = false; hold = null; receipts = new Map(); validation = false; localStorage.clear(); sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async (address, options) => {
        const url = new URL(address), path = url.pathname.replace("/api/v1", "");
        const data = options.body ? JSON.parse(options.body) : null;
        calls.push({ path, method: options.method, data, token: options.headers.Authorization, credentials: options.credentials, query: url.search });
        if (path === "/auth/csrf") return response({ token: "csrf" });
        if (path === "/auth/login" || path === "/auth/refresh") return response({ accessToken: "contact-token", expiresIn: 600, user: { id: 17, firstName: "Daniela", role, email: "admin@gmail.com" } });
        if (path === "/auth/me") return response({ id: 17, firstName: "Daniela", role });
        if (path === "/auth/logout") return response(null, 204);
        if (path === "/products") return response([{ id: 2, code: "KYN002", name: "Creatina", description: "Producto", category: "Creatinas", categoryId: 2, price: 21990, stock: 25, criticalStock: 5, version: 0, image: "", featured: true }]);
        if (path === "/cart") return response({ version: 0, items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0, canCheckout: false, warnings: [] });
        if (path === "/contact") {
            if (validation) return response({ detail: "Revisa los campos enviados.", errors: { comment: "Comentario rechazado por el servidor." } }, 400);
            if (hold) await hold;
            if (!receipts.has(data.submissionKey)) receipts.set(data.submissionKey, { reference: data.submissionKey, receivedAt: "2026-11-15T02:00:00Z" });
            if (failAfterReceipt) { failAfterReceipt = false; throw new TypeError("Failed to fetch"); }
            return response(receipts.get(data.submissionKey), 201);
        }
        if (path.startsWith("/admin/contact")) {
            if (offline) throw new TypeError("Failed to fetch");
            if (path === "/admin/contact") {
                const page = Number(url.searchParams.get("page") || 0), status = url.searchParams.get("status");
                const filtered = messages.filter(m => !status || m.status === status);
                return response({ items: filtered.slice(page * 20, page * 20 + 20), page, totalPages: Math.ceil(filtered.length / 20), totalElements: filtered.length });
            }
            const message = messages.find(m => m.id === Number(path.split("/")[3]));
            if (!message) return response({ detail: "El recurso no existe." }, 404);
            if (options.method === "PUT") {
                if (conflict) { message.note = "Atención de otra sesión"; message.version++; return response({ detail: "La atención cambió. Recarga antes de guardar." }, 409); }
                Object.assign(message, data, { version: message.version + 1 });
                message.history.push({ actorName: "Daniela", status: data.status, note: data.note, createdAt: "2026-11-15T02:00:00Z" });
            }
            return response(message);
        }
        throw new Error(`Ruta no prevista ${options.method} ${path}`);
    }));
    await apiSession.login("admin@gmail.com", "ClaveContacto2026!"); await remoteCatalog.reload();
});
afterEach(() => { apiSession.invalidate(); vi.unstubAllGlobals(); window.history.replaceState({}, "", "/"); });
afterAll(() => vi.unstubAllEnvs());
function open(path = "/contacto") { if (path === "/contacto") apiSession.invalidate(); window.history.replaceState({}, "", path); return render(<App />); }
const submissions = () => calls.filter(c => c.path === "/contact");

describe("Contacto conectado", () => {
    it("permite al visitante enviar sin credenciales y confirma solo la recepción persistida", async () => {
        apiSession.invalidate(); localStorage.setItem("kynex_cart", '[{"id":2,"quantity":3}]');
        open(); await screen.findByRole("link", { name: "Carrito (3)" }); const before = { ...localStorage };
        const user = userEvent.setup(); await fillContact(user, { ...contactData, name: "  Daniela  ", email: "  DANIELA@GMAIL.COM  " });
        await user.click(screen.getByRole("button", { name: "Enviar mensaje", exact: true }));
        expect(await screen.findByRole("status")).toHaveTextContent("Solicitud recibida. Referencia:");
        expect(submissions()[0]).toMatchObject({ data: { name: "Daniela", email: "daniela@gmail.com", comment: contactData.comment }, credentials: "omit", token: undefined });
        expect({ ...localStorage }).toEqual(before); expect(screen.getByRole("textbox", { name: "Comentario" })).toBeDisabled();
    });
    it("bloquea campos inválidos sin enviar y conserva el foco accesible", async () => {
        open(); await userEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveFocus(); expect(submissions()).toHaveLength(0);
    });
    it("conserva el borrador y reutiliza la referencia tras perder la respuesta del servidor", async () => {
        open(); const user = userEvent.setup(); await fillContact(user); failAfterReceipt = true;
        await user.click(screen.getByRole("button", { name: "Enviar mensaje" })); expect(await screen.findByRole("alert")).toHaveTextContent("No fue posible conectar");
        expect(screen.getByRole("textbox", { name: "Comentario" })).toHaveValue(contactData.comment); expect(screen.queryByRole("status")).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Enviar mensaje" })); expect(await screen.findByRole("status")).toHaveTextContent("Solicitud recibida");
        expect(submissions()[1].data.submissionKey).toBe(submissions()[0].data.submissionKey); expect(receipts.size).toBe(1);
    });
    it("asigna una nueva referencia al cambiar el contenido o iniciar un nuevo mensaje", async () => {
        open(); const user = userEvent.setup(); await fillContact(user); failAfterReceipt = true;
        await user.click(screen.getByRole("button", { name: "Enviar mensaje" })); await screen.findByRole("alert");
        await user.type(screen.getByRole("textbox", { name: "Comentario" }), " Corregido"); await user.click(screen.getByRole("button", { name: "Enviar mensaje" })); await screen.findByRole("status");
        expect(submissions()[0].data.submissionKey).not.toBe(submissions()[1].data.submissionKey);
        await user.click(screen.getByRole("button", { name: "Nuevo mensaje" })); expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue("");
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveFocus(); await fillContact(user); await user.click(screen.getByRole("button", { name: "Enviar mensaje" })); await screen.findByRole("status");
        expect(new Set(submissions().map(c => c.data.submissionKey)).size).toBe(3);
    });
    it("impide envíos repetidos mientras espera al servidor", async () => {
        let finish; hold = new Promise(resolve => { finish = resolve; }); open(); const user = userEvent.setup(); await fillContact(user);
        await user.dblClick(screen.getByRole("button", { name: "Enviar mensaje" })); expect(submissions()).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Enviando…" })).toBeDisabled(); expect(screen.queryByRole("status")).not.toBeInTheDocument();
        finish(); expect(await screen.findByRole("status")).toHaveTextContent("Solicitud recibida");
    });
    it("muestra validación del servidor y permite corregir sin perder los valores", async () => {
        validation = true; open(); const user = userEvent.setup(); await fillContact(user); await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));
        expect(await screen.findByText("Comentario rechazado por el servidor.")).toBeInTheDocument(); expect(screen.getByRole("textbox", { name: "Comentario" })).toHaveFocus();
        expect(screen.getByRole("textbox", { name: "Nombre", exact: true })).toHaveValue(contactData.name);
    });
    it("consulta la bandeja y abre el mensaje original sin interpretar su contenido como HTML", async () => {
        open("/admin/contacto"); const user = userEvent.setup(); expect(await screen.findByRole("table")).toHaveTextContent("Daniela Muñoz");
        await user.click(screen.getByRole("link", { name: "Ver solicitud 1 de Daniela Muñoz" }));
        expect(await screen.findByText(original.comment)).toBeInTheDocument(); expect(document.querySelector(".contact-original script")).toBeNull();
        expect(screen.getByRole("link", { name: "Contacto", exact: true })).toHaveAttribute("aria-current", "page");
    });
    it("filtra por estado y pagina resultados sin descargar toda la bandeja", async () => {
        messages = Array.from({ length: 21 }, (_, i) => ({ ...structuredClone(original), id: i + 1, name: `Remitente ${i + 1}`, status: i === 20 ? "RESUELTA" : "PENDIENTE" }));
        open("/admin/contacto"); const user = userEvent.setup(); await screen.findByRole("table");
        expect(screen.getByText("Página 1 de 2")).toBeInTheDocument(); await user.click(screen.getByRole("button", { name: "Siguiente" }));
        expect(await screen.findByRole("link", { name: "Ver solicitud 21 de Remitente 21" })).toBeInTheDocument();
        await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por estado" }), "RESUELTA"); await screen.findByText("Página 1 de 1");
        expect(calls.some(c => c.query === "?page=0&status=RESUELTA")).toBe(true); expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
    });
    it("guarda una atención con versión e incorpora el historial del servidor", async () => {
        open("/admin/contacto/1"); const user = userEvent.setup(); await user.selectOptions(await screen.findByRole("combobox", { name: "Estado de atención" }), "RESUELTA");
        await user.type(screen.getByRole("textbox", { name: "Nota interna" }), "  Se orientó al remitente  "); await user.click(screen.getByRole("button", { name: "Guardar atención" }));
        expect(await screen.findByText("Atención guardada correctamente.")).toBeInTheDocument();
        expect(calls.find(c => c.method === "PUT" && c.path === "/admin/contact/1")).toMatchObject({ data: { status: "RESUELTA", note: "Se orientó al remitente", version: 0 }, token: "Bearer contact-token" });
        expect(within(screen.getByRole("region", { name: "Historial de atención" })).getByText("Se orientó al remitente")).toBeInTheDocument();
    });
    it("exige una nota al resolver sin enviar escrituras inválidas", async () => {
        open("/admin/contacto/1"); const user = userEvent.setup(); await user.selectOptions(await screen.findByRole("combobox", { name: "Estado de atención" }), "RESUELTA");
        await user.click(screen.getByRole("button", { name: "Guardar atención" })); expect(screen.getByText("Describe la atención antes de resolver la consulta.")).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Nota interna" })).toHaveFocus(); expect(calls.some(c => c.method === "PUT")).toBe(false);
    });
    it("conserva la nota ante conflicto y recarga únicamente por decisión del administrador", async () => {
        open("/admin/contacto/1"); const user = userEvent.setup(); const note = await screen.findByRole("textbox", { name: "Nota interna" });
        await user.type(note, "Mi borrador"); conflict = true; await user.click(screen.getByRole("button", { name: "Guardar atención" }));
        expect(await screen.findByRole("alert")).toHaveTextContent("La atención cambió"); expect(note).toHaveValue("Mi borrador"); expect(screen.getByRole("button", { name: "Guardar atención" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "Recargar datos y descartar borrador" })); expect(await screen.findByDisplayValue("Atención de otra sesión")).toBeInTheDocument();
    });
    it.each(["Cliente", "Vendedor"])("protege la bandeja y oculta su acceso para %s", async next => {
        role = next; await apiSession.identity(); open("/admin/contacto/1");
        await vi.waitFor(() => expect(window.location.pathname).toBe(next === "Cliente" ? "/productos" : "/admin"));
        expect(calls.some(c => c.path.startsWith("/admin/contact"))).toBe(false); expect(screen.queryAllByRole("link", { name: "Contacto", exact: true }).some(link => link.getAttribute("href") === "/admin/contacto")).toBe(false);
    });
    it("envía al visitante al login antes de consultar mensajes privados", async () => {
        apiSession.invalidate(); open("/admin/contacto"); expect(await screen.findByRole("button", { name: "Iniciar sesión", exact: true })).toBeInTheDocument();
        expect(calls.some(c => c.path.startsWith("/admin/contact"))).toBe(false);
    });
    it("retira el contenido privado al cerrar sesión", async () => {
        open("/admin/contacto/1"); await screen.findByText(original.comment); await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        await vi.waitFor(() => expect(screen.queryByText(original.comment)).not.toBeInTheDocument()); expect(localStorage.getItem("kynex_contact")).toBeNull();
    });
    it("distingue un fallo de conexión de una bandeja vacía y permite reintentar", async () => {
        offline = true; open("/admin/contacto"); expect(await screen.findByText(/No fue posible conectar con el servidor/)).toBeInTheDocument();
        expect(screen.queryByText("No hay solicitudes para este filtro.")).not.toBeInTheDocument(); offline = false;
        await userEvent.click(screen.getByRole("button", { name: "Reintentar consulta" })); expect(await screen.findByRole("table")).toHaveTextContent(original.name);
    });
    it("rechaza un identificador inválido sin consultar una solicitud", async () => {
        open("/admin/contacto/1abc"); expect(await screen.findByRole("heading", { name: "Solicitud no encontrada" })).toBeInTheDocument();
        expect(calls.some(c => c.path.startsWith("/admin/contact"))).toBe(false);
    });
});
