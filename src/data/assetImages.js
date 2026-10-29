/*
 * Datos iniciales y contenido.
 * Relaciona rutas históricas conocidas de imágenes con URL que Vite puede empaquetar. Conserva
 * compatibilidad con selecciones guardadas.
 */

// Recursos originales: las rutas guardadas de la EP1 se resuelven también en producción.
export const assetImages = {
    "../../assets/img/blog/blog-creatina-rendimiento.jpg": new URL("../../assets/img/blog/blog-creatina-rendimiento.jpg", import.meta.url).href,
    "../../assets/img/blog/blog-recuperacion-muscular.jpg": new URL("../../assets/img/blog/blog-recuperacion-muscular.jpg", import.meta.url).href,
    "../../assets/img/brand/kynex-hero-home.jpg": new URL("../../assets/img/brand/kynex-hero-home.jpg", import.meta.url).href,
    "../../assets/img/brand/kynex-team-collaboration.jpg": new URL("../../assets/img/brand/kynex-team-collaboration.jpg", import.meta.url).href,
    "../../assets/img/products/kynex-creatina-monohidratada-unflavored.png": new URL("../../assets/img/products/kynex-creatina-monohidratada-unflavored.png", import.meta.url).href,
    "../../assets/img/products/kynex-multivitaminico-daily.png": new URL("../../assets/img/products/kynex-multivitaminico-daily.png", import.meta.url).href,
    "../../assets/img/products/kynex-plant-protein-vegan-chocolate.png": new URL("../../assets/img/products/kynex-plant-protein-vegan-chocolate.png", import.meta.url).href,
    "../../assets/img/products/kynex-pre-workout-energy-fruit-punch.png": new URL("../../assets/img/products/kynex-pre-workout-energy-fruit-punch.png", import.meta.url).href,
    "../../assets/img/products/kynex-recovery-magnesium-natural-citrus.png": new URL("../../assets/img/products/kynex-recovery-magnesium-natural-citrus.png", import.meta.url).href,
    "../../assets/img/products/kynex-whey-protein-vanilla.png": new URL("../../assets/img/products/kynex-whey-protein-vanilla.png", import.meta.url).href,
    "../../assets/img/training/curl-biceps.jpg": new URL("../../assets/img/training/curl-biceps.jpg", import.meta.url).href,
    "../../assets/img/training/jalon-pecho.jpg": new URL("../../assets/img/training/jalon-pecho.jpg", import.meta.url).href,
    "../../assets/img/training/peso-muerto-rumano.jpg": new URL("../../assets/img/training/peso-muerto-rumano.jpg", import.meta.url).href,
    "../../assets/img/training/plancha-abdominal.jpg": new URL("../../assets/img/training/plancha-abdominal.jpg", import.meta.url).href,
    "../../assets/img/training/press-banca.jpg": new URL("../../assets/img/training/press-banca.jpg", import.meta.url).href,
    "../../assets/img/training/press-militar.jpg": new URL("../../assets/img/training/press-militar.jpg", import.meta.url).href,
    "../../assets/img/training/remo-mancuerna.jpg": new URL("../../assets/img/training/remo-mancuerna.jpg", import.meta.url).href,
    "../../assets/img/training/sentadilla.jpg": new URL("../../assets/img/training/sentadilla.jpg", import.meta.url).href,
    "../../assets/img/training/training-hero-deadlift.jpg": new URL("../../assets/img/training/training-hero-deadlift.jpg", import.meta.url).href
};
