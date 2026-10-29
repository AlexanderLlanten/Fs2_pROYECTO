/*
 * Pruebas automatizadas.
 * Pruebas de integración. Biblioteca y rutina integradas, filtros, duplicados, edición, persistencia
 * y conservación al cerrar sesión.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { loginUser, SESSION_KEY, USERS_KEY } from "./services/auth.js";
import { PRODUCTS_KEY } from "./services/productStore.js";
import { ROUTINE_KEY } from "./services/routineStore.js";
import { CART_KEY } from "./utils/cart.js";

function openPage(path = "/entrenamiento", email) {
    if (email) loginUser(email, "1234");
    window.history.replaceState({}, "", path); return render(<App />);
}
const exercise = name => within(screen.getByRole("article", { name }));
function changeRoutine(raw, key = ROUTINE_KEY) {
    act(() => {
        if (raw === null) localStorage.removeItem(ROUTINE_KEY); else localStorage.setItem(ROUTINE_KEY, raw);
        window.dispatchEvent(new StorageEvent("storage", { key, storageArea: localStorage }));
    });
}

describe("Entrenamiento y rutina integrados", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => { vi.restoreAllMocks(); window.history.replaceState({}, "", "/"); });
    it.each([undefined, "camila@gmail.com", "martin@duoc.cl", "admin@profesor.duoc.cl"])("permite ambas páginas públicas al perfil %s", async email => {
        const user = userEvent.setup(); openPage("/entrenamiento", email);
        expect(screen.getByRole("heading", { level: 1, name: "Entrenamiento" })).toBeInTheDocument();
        expect(screen.getAllByRole("article")).toHaveLength(8);
        await user.click(screen.getByRole("link", { name: "Ver mi rutina (0)" }));
        expect(screen.getByRole("heading", { level: 1, name: "Mi rutina" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Tu rutina está vacía" })).toBeInTheDocument();
        expect(screen.getAllByRole("banner")).toHaveLength(1); expect(screen.getAllByRole("main")).toHaveLength(1);
        expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    });
    it("abre los enlaces de cabecera y pie, marca la ruta y cierra el menú móvil", async () => {
        const user = userEvent.setup(); openPage("/"); const header = within(screen.getByRole("banner"));
        await user.click(header.getByRole("button", { name: "Abrir menú" }));
        await user.click(header.getByRole("link", { name: "Entrenamiento" }));
        expect(header.getByRole("button", { name: "Abrir menú" })).toHaveAttribute("aria-expanded", "false");
        expect(header.getByRole("link", { name: "Entrenamiento" })).toHaveAttribute("aria-current", "page");
        await user.click(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Mi rutina" }));
        expect(window.location.pathname).toBe("/rutina");
        expect(header.getByRole("link", { name: "Mi rutina" })).toHaveAttribute("aria-current", "page");
        expect(header.getByRole("link", { name: "Entrenamiento" })).not.toHaveAttribute("aria-current");
    });
    it("agrega sin duplicar, ajusta series y repeticiones y restaura al recargar", async () => {
        const user = userEvent.setup(); const view = openPage();
        await user.click(exercise("Sentadilla").getByRole("button"));
        expect(screen.getByRole("status")).toHaveTextContent("Sentadilla fue agregado a tu rutina.");
        expect(exercise("Sentadilla").getByRole("button", { name: "En mi rutina" })).toBeDisabled();
        await user.click(exercise("Plancha abdominal").getByRole("button"));
        await user.click(screen.getByRole("link", { name: "Ver mi rutina (2)" }));
        const summary = within(screen.getByRole("region", { name: "Resumen de mi rutina" }));
        expect(summary.getByText("2")).toBeInTheDocument(); expect(summary.getByText("7")).toBeInTheDocument();
        const sets = exercise("Sentadilla").getByRole("spinbutton", { name: "Series" });
        await user.clear(sets); await user.type(sets, "6"); await user.tab();
        expect(summary.getByText("9")).toBeInTheDocument();
        const reps = exercise("Sentadilla").getByRole("spinbutton", { name: "Repeticiones" });
        await user.clear(reps); await user.type(reps, "12{Enter}");
        view.unmount(); openPage("/rutina");
        expect(exercise("Sentadilla").getByRole("spinbutton", { name: "Series" })).toHaveValue(6);
        expect(exercise("Sentadilla").getByRole("spinbutton", { name: "Repeticiones" })).toHaveValue(12);
        expect(exercise("Plancha abdominal").getByRole("spinbutton", { name: "Series" })).toHaveValue(3);
    });
    it("quita un ejercicio y vuelve a permitir agregarlo desde la biblioteca", async () => {
        localStorage.setItem(ROUTINE_KEY, '[{"id":2,"sets":5,"reps":9}]');
        const user = userEvent.setup(); openPage("/rutina");
        await user.click(exercise("Sentadilla").getByRole("button"));
        expect(screen.getByRole("heading", { name: "Tu rutina está vacía" })).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(ROUTINE_KEY))).toEqual([]);
        await user.click(screen.getByRole("link", { name: "Explorar ejercicios" }));
        expect(exercise("Sentadilla").getByRole("button")).toBeEnabled();
    });
    it("enfoca Cancelar, respeta cancelación y Escape y exige confirmar para vaciar", async () => {
        const raw = '[{"id":2,"sets":5,"reps":9}]'; localStorage.setItem(ROUTINE_KEY, raw);
        const user = userEvent.setup(); openPage("/rutina");
        const clear = screen.getByRole("button", { name: "Vaciar rutina" });
        await user.click(clear);
        let dialog = screen.getByRole("dialog", { name: "Vaciar mi rutina" });
        expect(within(dialog).getByRole("button", { name: "Cancelar" })).toHaveFocus();
        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
        expect(localStorage.getItem(ROUTINE_KEY)).toBe(raw); expect(clear).toHaveFocus();
        await user.click(clear); dialog = screen.getByRole("dialog"); fireEvent(dialog, new Event("cancel", { cancelable: true }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); expect(localStorage.getItem(ROUTINE_KEY)).toBe(raw);
        await user.click(clear); await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Vaciar rutina" }));
        expect(localStorage.getItem(ROUTINE_KEY)).toBeNull(); expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toHaveTextContent("Tu rutina se vació correctamente.");
    });
    it("recupera datos heredados, actualiza desde otra pestaña y responde a la limpieza", () => {
        localStorage.setItem(ROUTINE_KEY, '[{"id":1,"sets":"5","reps":"9"}]'); openPage("/rutina");
        expect(exercise("Press de banca").getByRole("spinbutton", { name: "Series" })).toHaveValue(5);
        changeRoutine('[{"id":1,"sets":7,"reps":12},{"id":2,"sets":3,"reps":10}]');
        expect(exercise("Press de banca").getByRole("spinbutton", { name: "Series" })).toHaveValue(7);
        expect(screen.getAllByRole("article")).toHaveLength(2);
        changeRoutine(null, null); expect(screen.getByRole("heading", { name: "Tu rutina está vacía" })).toBeInTheDocument();
    });
    it("anuncia datos dañados sin sobrescribir y permite reintentar después de recuperarlos", async () => {
        localStorage.setItem(ROUTINE_KEY, "{"); const user = userEvent.setup(); openPage();
        expect(screen.getByRole("alert")).toHaveTextContent("No se modificaron tus datos");
        expect(exercise("Sentadilla").getByRole("button")).toBeDisabled();
        localStorage.setItem(ROUTINE_KEY, "[]");
        await user.click(screen.getByRole("button", { name: "Reintentar lectura de rutina" }));
        expect(exercise("Sentadilla").getByRole("button")).toBeEnabled();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    it("informa fallos al agregar y conserva la selección anterior", async () => {
        const user = userEvent.setup(); openPage();
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
        await user.click(exercise("Sentadilla").getByRole("button"));
        expect(screen.getByRole("alert")).toHaveTextContent("No fue posible guardar");
        expect(exercise("Sentadilla").getByRole("button")).toBeEnabled();
        expect(localStorage.getItem(ROUTINE_KEY)).toBeNull();
    });
    it("mantiene los ejercicios y el diálogo si falla el vaciado", async () => {
        localStorage.setItem(ROUTINE_KEY, '[{"id":2,"sets":4,"reps":8}]'); const user = userEvent.setup(); openPage("/rutina");
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("denied"); });
        await user.click(screen.getByRole("button", { name: "Vaciar rutina" }));
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Vaciar rutina" }));
        expect(within(screen.getByRole("dialog")).getByRole("alert")).toHaveTextContent("No fue posible guardar");
        expect(screen.getByRole("article", { name: "Sentadilla" })).toBeInTheDocument();
    });
    it.each(["/entrenamiento", "/rutina"])("vuelve a %s después de Login y conserva rutina y compra al cerrar sesión", async path => {
        localStorage.setItem(ROUTINE_KEY, '[{"id":2,"sets":5,"reps":9}]'); localStorage.setItem(CART_KEY, '[{"id":2,"quantity":3}]');
        const user = userEvent.setup(); openPage(`${path}?origen=pie`);
        await user.click(within(screen.getByRole("banner")).getByRole("link", { name: "Iniciar sesión", exact: true }));
        await user.click(screen.getByRole("textbox", { name: "Correo electrónico" })); await user.paste("martin@duoc.cl");
        await user.type(screen.getByLabelText(/^Contraseña/), "1234"); await user.click(screen.getByRole("button", { name: "Iniciar sesión", exact: true }));
        expect(await screen.findByRole("heading", { level: 1, name: path === "/rutina" ? "Mi rutina" : "Entrenamiento" })).toBeInTheDocument();
        expect(window.location.pathname + window.location.search).toBe(`${path}?origen=pie`);
        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(localStorage.getItem(SESSION_KEY)).toBeNull();
        expect(localStorage.getItem(ROUTINE_KEY)).toBe('[{"id":2,"sets":5,"reps":9}]');
        expect(screen.getByRole("link", { name: "Carrito (3)" })).toBeInTheDocument();
    });
    it("modifica solo la rutina, sin alterar sesión, usuarios, catálogo ni carrito", async () => {
        localStorage.setItem(CART_KEY, '[{"id":2,"quantity":2}]');
        const user = userEvent.setup(); openPage("/entrenamiento", "camila@gmail.com");
        const keys = [SESSION_KEY, USERS_KEY, PRODUCTS_KEY, CART_KEY]; const before = keys.map(key => localStorage.getItem(key));
        await user.click(exercise("Sentadilla").getByRole("button"));
        expect(keys.map(key => localStorage.getItem(key))).toEqual(before);
    });
    it.each(["/entrenamiento/desconocido", "/rutina/desconocida"])("muestra 404 en %s", path => {
        openPage(path); expect(screen.getByRole("heading", { level: 1, name: "Página no encontrada" })).toBeInTheDocument();
    });
});
