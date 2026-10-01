"use strict";

/* =========================================================
   KYNEX - DATOS DE PRODUCTOS
========================================================= */

export const products = [

    {
        id: 1,

        name: "Whey Protein Performance",

        slug: "whey-protein-performance",

        category: "Proteínas",

        brand: "KYNEX Nutrition",

        price: 39990,

        stock: 18,

        code: "KYN001",
        
        criticalStock: 5,

        featured: true,

        format: "2 lb",

        flavor: "Chocolate",

        goals: [
            "Aumento de masa",
            "Recuperación"
        ],

        dietaryTags: [
            "Sin azúcar añadida"
        ],

        allergens: [
            "Leche",
            "Soya"
        ],

        ingredients: [
            "Proteína de suero de leche",
            "Cacao en polvo",
            "Saborizante",
            "Lecitina de soya",
            "Edulcorante"
        ],

        description:
            "Proteína de suero orientada al apoyo nutricional posterior al entrenamiento.",

        benefits: [
            "Aporte de proteínas",
            "Apoyo a la recuperación muscular",
            "Complemento para alimentación deportiva"
        ],

        usage: {
            serving:
                "1 medida",

            preparation:
                "Mezclar una porción con 250 ml de agua o leche.",

            moment:
                "Puede consumirse después del entrenamiento o según las necesidades nutricionales."
        },

        nutrition: {
            servingSize:
                "30 g",

            calories:
                120,

            protein:
                "24 g",

            carbohydrates:
                "3 g",

            fats:
                "2 g"
        },

        certifications: [
            "GMP"
        ],

        warning:
            "Producto demostrativo. La información no reemplaza la orientación de un profesional de la salud.",

        icon:
            "bi-cup-straw"
    },


    {
        id: 2,

        name: "Creatina Monohidratada",

        slug: "creatina-monohidratada",

        category: "Creatinas",

        brand: "KYNEX Nutrition",

        price: 21990,

        stock: 25,

        code: "KYN002",

        criticalStock: 5,

        featured: true,

        format: "300 g",

        flavor: "Sin sabor",

        goals: [
            "Fuerza",
            "Rendimiento",
            "Aumento de masa"
        ],

        dietaryTags: [
            "Vegano",
            "Sin azúcar añadida"
        ],

        allergens: [],

        ingredients: [
            "Creatina monohidratada"
        ],

        description:
            "Creatina monohidratada en polvo para complementar planes de entrenamiento.",

        benefits: [
            "Complemento para entrenamiento de fuerza",
            "Formato sin sabor",
            "Fácil incorporación a bebidas"
        ],

        usage: {
            serving:
                "5 g",

            preparation:
                "Disolver una porción en agua u otra bebida.",

            moment:
                "Puede incorporarse diariamente dentro del plan de suplementación."
        },

        nutrition: {
            servingSize:
                "5 g",

            calories:
                0,

            protein:
                "0 g",

            carbohydrates:
                "0 g",

            fats:
                "0 g"
        },

        certifications: [
            "GMP",
            "Vegan"
        ],

        warning:
            "Producto demostrativo. Se recomienda revisar las condiciones particulares antes de incorporar suplementos.",

        icon:
            "bi-lightning-charge"
    },


    {
        id: 3,

        name: "Pre Workout Energy",

        slug: "pre-workout-energy",

        category: "Pre-entreno",

        brand: "KYNEX Nutrition",

        price: 26990,

        stock: 12,

        code: "KYN003",

        criticalStock: 5,

        featured: true,

        format: "30 porciones",

        flavor: "Frutos rojos",

        goals: [
            "Energía",
            "Enfoque"
        ],

        dietaryTags: [
            "Sin azúcar añadida"
        ],

        allergens: [],

        ingredients: [
            "Citrulina",
            "Beta-alanina",
            "Cafeína",
            "Saborizante",
            "Edulcorante"
        ],

        description:
            "Fórmula demostrativa orientada al consumo previo a sesiones de entrenamiento.",

        benefits: [
            "Complemento previo al entrenamiento",
            "Preparación rápida",
            "Formato en polvo"
        ],

        usage: {
            serving:
                "1 medida",

            preparation:
                "Mezclar con aproximadamente 250 ml de agua.",

            moment:
                "Consumir previo al entrenamiento según las indicaciones del producto."
        },

        nutrition: {
            servingSize:
                "10 g",

            calories:
                10,

            protein:
                "0 g",

            carbohydrates:
                "2 g",

            fats:
                "0 g"
        },

        certifications: [
            "GMP"
        ],

        warning:
            "Producto demostrativo. Las formulaciones con estimulantes requieren especial atención a tolerancia y condiciones individuales.",

        icon:
            "bi-fire"
    },


    {
        id: 4,

        name: "Multivitamínico Daily",

        slug: "multivitaminico-daily",

        category: "Vitaminas",

        brand: "KYNEX Nutrition",

        price: 17990,

        stock: 30,

        code: "KYN004",

        criticalStock: 5,
        
        featured: false,

        format: "60 cápsulas",

        flavor: "Sin sabor",

        goals: [
            "Bienestar",
            "Nutrición"
        ],

        dietaryTags: [],

        allergens: [],

        ingredients: [
            "Complejo vitamínico",
            "Minerales",
            "Cápsula vegetal"
        ],

        description:
            "Complemento vitamínico demostrativo para acompañar una alimentación equilibrada.",

        benefits: [
            "Formato en cápsulas",
            "Uso sencillo",
            "Complemento nutricional"
        ],

        usage: {
            serving:
                "1 cápsula",

            preparation:
                "Consumir con agua.",

            moment:
                "Preferentemente junto a una comida."
        },

        nutrition: {
            servingSize:
                "1 cápsula",

            calories:
                0,

            protein:
                "0 g",

            carbohydrates:
                "0 g",

            fats:
                "0 g"
        },

        certifications: [
            "GMP"
        ],

        warning:
            "Producto demostrativo. No sustituye una alimentación equilibrada.",

        icon:
            "bi-capsule"
    },


    {
        id: 5,

        name: "Plant Protein Vegan",

        slug: "plant-protein-vegan",

        category: "Proteínas",

        brand: "KYNEX Nutrition",

        price: 34990,

        stock: 15,

        code: "KYN005",

        criticalStock: 5,
        
        featured: false,

        format: "1.5 lb",

        flavor: "Vainilla",

        goals: [
            "Aumento de masa",
            "Recuperación"
        ],

        dietaryTags: [
            "Vegano",
            "Sin lactosa"
        ],

        allergens: [],

        ingredients: [
            "Proteína de arveja",
            "Proteína de arroz",
            "Saborizante natural",
            "Edulcorante"
        ],

        description:
            "Proteína vegetal demostrativa orientada a usuarios que prefieren alternativas sin ingredientes lácteos.",

        benefits: [
            "Fuente vegetal de proteínas",
            "Alternativa sin lactosa",
            "Compatible con alimentación vegana"
        ],

        usage: {
            serving:
                "1 medida",

            preparation:
                "Mezclar con aproximadamente 250 ml de agua o bebida vegetal.",

            moment:
                "Puede incorporarse después del entrenamiento o como complemento alimentario."
        },

        nutrition: {
            servingSize:
                "32 g",

            calories:
                125,

            protein:
                "22 g",

            carbohydrates:
                "4 g",

            fats:
                "2 g"
        },

        certifications: [
            "Vegan",
            "GMP"
        ],

        warning:
            "Producto demostrativo. Revisar ingredientes y posibles sensibilidades alimentarias.",

        icon:
            "bi-leaf"
    },


    {
        id: 6,

        name: "Recovery Magnesium",

        slug: "recovery-magnesium",

        category: "Vitaminas",

        brand: "KYNEX Nutrition",

        price: 15990,

        stock: 22,

        code: "KYN006",
        
        criticalStock: 5,

        featured: false,

        format: "60 cápsulas",

        flavor: "Sin sabor",

        goals: [
            "Recuperación",
            "Descanso"
        ],

        dietaryTags: [
            "Vegano"
        ],

        allergens: [],

        ingredients: [
            "Magnesio",
            "Cápsula vegetal"
        ],

        description:
            "Suplemento demostrativo de magnesio presentado como complemento dentro del catálogo KYNEX.",

        benefits: [
            "Formato práctico",
            "Orientado al segmento de recuperación",
            "Compatible con dieta vegana"
        ],

        usage: {
            serving:
                "1 cápsula",

            preparation:
                "Consumir con agua.",

            moment:
                "Utilizar según las instrucciones indicadas en el producto."
        },

        nutrition: {
            servingSize:
                "1 cápsula",

            calories:
                0,

            protein:
                "0 g",

            carbohydrates:
                "0 g",

            fats:
                "0 g"
        },

        certifications: [
            "Vegan",
            "GMP"
        ],

        warning:
            "Producto demostrativo. Su uso debe considerar necesidades individuales y orientación profesional cuando corresponda.",

        icon:
            "bi-moon-stars"
    }

];