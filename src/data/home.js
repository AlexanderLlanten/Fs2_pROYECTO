/*
 * Datos iniciales y contenido.
 * Contiene categorías, objetivos y bloques informativos usados por la portada.
 */

export const homeCategories = [
    {
        name: "Proteínas",
        icon: "bi-cup-straw",
        description: "Explora las opciones de proteína de suero y vegetal."
    },
    {
        name: "Creatinas",
        icon: "bi-lightning-charge",
        description: "Complementa tu plan de entrenamiento de fuerza."
    },
    {
        name: "Vitaminas",
        icon: "bi-capsule",
        description: "Encuentra alternativas para tu nutrición cotidiana."
    },
    {
        name: "Pre-entreno",
        icon: "bi-fire",
        description: "Conoce las opciones para antes de tu sesión."
    }
];

export const homeFeatures = [
    {
        title: "Suplementación clara",
        icon: "bi-bag-check",
        description: "Consulta información nutricional, ingredientes, modo de uso, alérgenos, precio y disponibilidad de cada producto antes de elegir.",
        action: { label: "Explorar tienda", to: "/productos" }
    },
    {
        title: "Entrenamiento",
        icon: "bi-activity",
        description: "Explora ejercicios por grupo muscular, dificultad y equipamiento para construir tu rutina.",
        action: { label: "Ver ejercicios", to: "/entrenamiento" }
    },
    {
        title: "Evolución deportiva",
        icon: "bi-graph-up-arrow",
        description: "Conoce la propuesta KYNEX, que conecta suplementación, conocimiento y entrenamiento en una misma experiencia.",
        action: { label: "Conocer KYNEX", to: "/nosotros" }
    }
];

export const homeGoals = [
    { name: "Aumento de masa", icon: "bi-graph-up-arrow" },
    { name: "Energía", icon: "bi-lightning-charge" },
    { name: "Recuperación", icon: "bi-heart-pulse" },
    { name: "Descanso", icon: "bi-moon-stars" }
];
