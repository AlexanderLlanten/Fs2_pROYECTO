import { beforeEach, afterEach, afterAll, describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.hoisted(() => vi.stubEnv("VITE_DATA_SOURCE", "api"));
import App from "./App.jsx";
import { apiSession } from "./services/api/session.js";
import { remoteCatalog } from "./services/api/catalogStore.js";

const reference = "12345678-1234-4234-8234-123456789abc", date = "2026-11-15T04:00:00Z";
let role, calls, message, linked, conflict, lostReply, failedClaim;
const response = (value, status = 200) => ({ ok: status < 400, status, json: async () => structuredClone(value) });
beforeEach(async () => {
    role = "Cliente"; calls = []; linked = true; conflict = false; lostReply = false; failedClaim = false;
    message = { id: 4, reference, name: "Camila Prueba", email: "camila@example.org", comment: "Mi consulta original", status: "PENDIENTE", note: "NOTA INTERNA PRIVADA", version: 0, createdAt: date, updatedAt: date, history: [], linked: true, replies: [] };
    localStorage.clear(); sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn(async (address, options) => {
        const url = new URL(address), path = url.pathname.replace("/api/v1", ""), data = options.body ? JSON.parse(options.body) : null;
        calls.push({ path, data, method: options.method, token: options.headers.Authorization, url: address });
        if (path === "/auth/csrf") return response({ token: "csrf" });
        if (path === "/auth/login" || path === "/auth/refresh") return response({ accessToken: "reply-token", expiresIn: 600, user: { id: 17, firstName: "Camila", lastName: "Prueba", email: "camila@example.org", role } });
        if (path === "/auth/me") return response({ id: 17, firstName: "Camila", lastName: "Prueba", email: "camila@example.org", role });
        if (path === "/auth/logout") return response(null, 204);
        if (path === "/products") return response([]);
        if (path === "/cart") return response({ version: 0, items: [], totalItems: 0, subtotal: 0, shipping: 0, total: 0, canCheckout: false, warnings: [] });
        if (path === "/my/contact" && options.method === "POST") return response({ reference: data.submissionKey, receivedAt: date }, 201);
        if (path === "/my/contact") return response({ items: linked ? [{ id: 4, reference, preview: message.comment, status: message.status, createdAt: date }] : [], page: 0, totalPages: linked ? 1 : 0, totalElements: linked ? 1 : 0 });
        if (path === "/my/contact/claims") { if (failedClaim) return response({ detail: "El recurso no existe." }, 404); linked = true; return response(message); }
        if (path.startsWith("/my/contact/")) return path === "/my/contact/4" ? response(message) : response({ detail: "El recurso no existe." }, 404);
        if (path.startsWith("/admin/contact/4")) {
            if (options.method === "POST") {
                const previous = message.replies.find(r => r.key === data.replyKey);
                if (previous) return response(message);
                if (conflict) { message.version++; return response({ detail: "La atención cambió. Recarga antes de enviar la respuesta." }, 409); }
                message.replies.push({ text: data.text, createdAt: date, key: data.replyKey }); message.version++; if (message.status === "PENDIENTE") message.status = "EN_ATENCION";
                if (lostReply) { lostReply = false; throw new TypeError("Failed to fetch"); }
            } else if (options.method === "PUT") { Object.assign(message, data, { version: message.version + 1 }); }
            return response(message);
        }
        throw new Error(`Ruta no prevista ${options.method} ${path}`);
    }));
    await apiSession.login("camila@example.org", "ClaveRespuestas2026!"); await remoteCatalog.reload();
});
afterEach(() => { apiSession.invalidate(); vi.unstubAllGlobals(); window.history.replaceState({}, "", "/"); });
afterAll(() => vi.unstubAllEnvs());
function open(path) { window.history.replaceState({}, "", path); return render(<App />); }
async function admin() { role = "Administrador"; await apiSession.identity(); }

describe("Respuestas de contacto por cuenta", () => {
    it("vincula nuevos envíos con la identidad autenticada sin permitir elegir otra persona", async () => {
        open("/contacto"); const user = userEvent.setup(); const name = await screen.findByRole("textbox", { name: "Nombre", exact: true });
        expect(name).toHaveValue("Camila Prueba"); expect(name).toHaveAttribute("readonly"); expect(screen.getByRole("textbox", { name: "Correo electrónico", exact: true })).toHaveValue("camila@example.org");
        await user.type(screen.getByRole("textbox", { name: "Comentario" }), "Consulta desde mi cuenta"); await user.click(screen.getByRole("button", { name: "Enviar mensaje", exact: true }));
        expect(await screen.findByRole("status")).toHaveTextContent("Solicitud recibida");
        const sent = calls.find(c => c.method === "POST" && c.path === "/my/contact"); expect(sent.token).toBe("Bearer reply-token"); expect(Object.keys(sent.data).sort()).toEqual(["comment", "submissionKey"]);
        await user.click(screen.getByRole("button", { name: "Nuevo mensaje" })); expect(name).toHaveValue("Camila Prueba"); expect(screen.getByRole("textbox", { name: "Comentario" })).toHaveValue("");
    });
    it("permite navegar desde Mis consultas hasta las respuestas propias", async () => {
        message.replies = [{ text: "La respuesta de soporte", createdAt: date }]; open("/consultas"); const user = userEvent.setup();
        await user.click(await screen.findByRole("link", { name: "Ver consulta y respuestas #4" })); expect(await screen.findByText("La respuesta de soporte")).toBeInTheDocument();
        expect(screen.getByText(message.comment)).toBeInTheDocument(); expect(screen.queryByText("NOTA INTERNA PRIVADA")).not.toBeInTheDocument();
    });
    it("no presenta una nota interna como respuesta aunque la consulta esté resuelta", async () => {
        message.status = "RESUELTA"; open("/consultas/4"); expect(await screen.findByText("Esta consulta todavía no tiene una respuesta publicada.")).toBeInTheDocument();
        expect(screen.queryByText("NOTA INTERNA PRIVADA")).not.toBeInTheDocument(); expect(screen.queryByRole("textbox", { name: "Nota interna" })).not.toBeInTheDocument();
    });
    it("recupera respuestas nuevas mediante actualización explícita", async () => {
        open("/consultas/4"); await screen.findByText("Esta consulta todavía no tiene una respuesta publicada."); message.replies.push({ text: "Respuesta posterior", createdAt: date });
        await userEvent.click(screen.getByRole("button", { name: "Actualizar respuestas" })); expect(await screen.findByText("Respuesta posterior")).toBeInTheDocument();
    });
    it("vincula un mensaje anterior usando su referencia y abre su detalle", async () => {
        linked = false; open("/consultas"); const user = userEvent.setup(); await screen.findByText("No tienes consultas vinculadas a tu cuenta.");
        await user.type(screen.getByRole("textbox", { name: "Referencia de recepción" }), reference); await user.click(screen.getByRole("button", { name: "Vincular consulta", exact: true }));
        expect(await screen.findByRole("heading", { name: "Mi consulta #4" })).toBeInTheDocument(); expect(calls.find(c => c.path === "/my/contact/claims")).toMatchObject({ method: "POST", data: { reference }, token: "Bearer reply-token" });
    });
    it("rechaza referencias incompletas antes de enviar y explica un vínculo rechazado", async () => {
        linked = false; failedClaim = true; open("/consultas"); const user = userEvent.setup(); const field = await screen.findByRole("textbox", { name: "Referencia de recepción" });
        await user.type(field, "1234"); await user.click(screen.getByRole("button", { name: "Vincular consulta", exact: true })); expect(field).toHaveFocus(); expect(calls.some(c => c.path === "/my/contact/claims")).toBe(false);
        await user.clear(field); await user.type(field, reference); await user.click(screen.getByRole("button", { name: "Vincular consulta", exact: true }));
        expect(await screen.findByText("No fue posible vincular la consulta. Comprueba la referencia y que el correo coincida con tu cuenta.")).toBeInTheDocument(); expect(field).toHaveValue(reference);
    });
    it.each(["/consultas", "/consultas/4"])("protege %s antes de consultar datos cuando no hay sesión", async path => {
        apiSession.invalidate(); open(path); expect(await screen.findByRole("button", { name: "Iniciar sesión", exact: true })).toBeInTheDocument();
        expect(calls.some(c => c.path.startsWith("/my/contact"))).toBe(false);
    });
    it("muestra el rechazo de un recurso ajeno sin sustituirlo por datos propios", async () => {
        open("/consultas/99"); expect(await screen.findByRole("alert")).toHaveTextContent("El recurso no existe."); expect(screen.queryByText(message.comment)).not.toBeInTheDocument();
    });
    it("publica una respuesta separada conservando el borrador de la nota interna", async () => {
        await admin(); open("/admin/contacto/4"); const user = userEvent.setup(); const note = await screen.findByRole("textbox", { name: "Nota interna" });
        await user.clear(note); await user.type(note, "Borrador interno sin guardar"); await user.type(screen.getByRole("textbox", { name: "Respuesta para el usuario" }), "Respuesta visible");
        await user.click(screen.getByRole("button", { name: "Enviar respuesta", exact: true })); expect(await screen.findByText("Respuesta publicada para el usuario.")).toBeInTheDocument();
        expect(note).toHaveValue("Borrador interno sin guardar"); expect(message.note).toBe("NOTA INTERNA PRIVADA");
        expect(screen.getByRole("combobox", { name: "Estado de atención" })).toHaveValue("EN_ATENCION");
        const sent = calls.find(c => c.path.endsWith("/replies")); expect(sent).toMatchObject({ method: "POST", token: "Bearer reply-token", data: { text: "Respuesta visible", version: 0 } });
        expect(screen.getByRole("textbox", { name: "Respuesta para el usuario" })).toHaveValue("");
    });
    it("guardar la atención no descarta una respuesta que todavía se está escribiendo", async () => {
        await admin(); open("/admin/contacto/4"); const user = userEvent.setup(); const reply = await screen.findByRole("textbox", { name: "Respuesta para el usuario" });
        await user.type(reply, "Respuesta en preparación"); await user.click(screen.getByRole("button", { name: "Guardar atención", exact: true }));
        expect(await screen.findByText("Atención guardada correctamente.")).toBeInTheDocument(); expect(reply).toHaveValue("Respuesta en preparación");
    });
    it("conserva una respuesta ante conflicto y bloquea nuevas escrituras hasta recargar", async () => {
        await admin(); conflict = true; open("/admin/contacto/4"); const user = userEvent.setup(); const reply = await screen.findByRole("textbox", { name: "Respuesta para el usuario" });
        await user.type(reply, "Mi respuesta sin publicar"); await user.click(screen.getByRole("button", { name: "Enviar respuesta", exact: true }));
        expect(await screen.findByRole("alert")).toHaveTextContent("La atención cambió"); expect(reply).toHaveValue("Mi respuesta sin publicar");
        expect(screen.getByRole("button", { name: "Enviar respuesta", exact: true })).toBeDisabled(); expect(screen.getByRole("button", { name: "Guardar atención", exact: true })).toBeDisabled();
    });
    it("un reintento de respuesta conserva su referencia y no duplica la publicación", async () => {
        await admin(); lostReply = true; open("/admin/contacto/4"); const user = userEvent.setup(); const reply = await screen.findByRole("textbox", { name: "Respuesta para el usuario" });
        await user.type(reply, "Respuesta enviada una vez"); await user.click(screen.getByRole("button", { name: "Enviar respuesta", exact: true })); await screen.findByRole("alert");
        expect(reply).toHaveValue("Respuesta enviada una vez"); await user.click(screen.getByRole("button", { name: "Enviar respuesta", exact: true })); await screen.findByText("Respuesta publicada para el usuario.");
        const writes = calls.filter(c => c.path.endsWith("/replies")); expect(writes).toHaveLength(2); expect(writes[0].data.replyKey).toBe(writes[1].data.replyKey); expect(message.replies).toHaveLength(1);
    });
    it("no permite publicar respuestas vacías", async () => {
        await admin(); open("/admin/contacto/4"); await userEvent.click(await screen.findByRole("button", { name: "Enviar respuesta", exact: true }));
        expect(screen.getByRole("alert")).toHaveTextContent("Escribe la respuesta para el usuario."); expect(calls.some(c => c.path.endsWith("/replies"))).toBe(false);
    });
    it("retira las consultas y respuestas al cerrar sesión", async () => {
        message.replies.push({ text: "Respuesta privada de mi cuenta", createdAt: date }); open("/consultas/4"); await screen.findByText("Respuesta privada de mi cuenta");
        await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" })); await vi.waitFor(() => expect(screen.queryByText("Respuesta privada de mi cuenta")).not.toBeInTheDocument());
        expect(localStorage.getItem("kynex_contact")).toBeNull();
    });
});
