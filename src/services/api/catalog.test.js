import { describe, it, expect } from "vitest";
import { createCatalogApi } from "./catalog.js";
import { createRemoteCatalog } from "./catalogStore.js";

const product = { id: 2, code: "KYN002", category: "Creatinas", name: "Creatina", description: "Descripción", price: 21990, stock: 25, image: "/media/products/creatina.png" };

describe("Catálogo HTTP", () => {
    it("sirve las imágenes a través del mismo proxy que la API", async () => {
        const service = createCatalogApi(async () => [product], "/api/v1");
        expect((await service.products())[0].image).toBe(location.origin + "/media/products/creatina.png");
    });
    it("resuelve las imágenes desde el servidor y conserva los metadatos", async () => {
        const service = createCatalogApi(async () => [{ ...product, benefits: ["Fuerza"] }], "http://localhost:8080/api/v1");
        expect(await service.products()).toEqual([{ ...product, image: "http://localhost:8080/media/products/creatina.png", benefits: ["Fuerza"] }]);
    });
    it("acepta un catálogo vacío sin reponer semillas locales", async () => {
        expect(await createCatalogApi(async () => []).products()).toEqual([]);
    });
    it("rechaza productos inválidos o repetidos", async () => {
        await expect(createCatalogApi(async () => [product, product]).products()).rejects.toThrow(/formato válido/);
        await expect(createCatalogApi(async () => [{ ...product, stock: -1 }]).products()).rejects.toThrow(/formato válido/);
    });
    it("comparte la consulta y mantiene estable la instantánea", async () => {
        let calls = 0;
        const store = createRemoteCatalog(async () => { calls++; return [product]; });
        const unsubscribe = store.subscribe(() => {});
        store.subscribe(() => {});
        await store.reload();
        expect(calls).toBe(1);
        expect(store.read()).toBe(store.read());
        expect(store.read()).toMatchObject({ success: true, products: [product] });
        unsubscribe();
    });
    it("permite reintentar una caída sin usar datos locales", async () => {
        let available = false;
        const store = createRemoteCatalog(async () => { if (!available) throw new Error("Servidor desconectado"); return [product]; });
        await store.reload();
        expect(store.read()).toEqual({ success: false, loading: false, products: [], message: "Servidor desconectado" });
        available = true;
        await store.reload();
        expect(store.read()).toMatchObject({ success: true, loading: false, products: [product] });
    });
});
