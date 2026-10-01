"use strict";

/* =========================================================
   KYNEX - PEDIDOS DEMOSTRATIVOS
========================================================= */

export const orders = [

    {
        id: 1001,

        date: "2026-09-28",

        customer: {
            name: "Camila Soto Pérez",
            email: "camila@gmail.com"
        },

        status: "Preparación",

        products: [

            {
                id: 1,
                name: "Whey Protein Performance",
                price: 39990,
                quantity: 1
            },

            {
                id: 2,
                name: "Creatina Monohidratada",
                price: 21990,
                quantity: 1
            }

        ]
    },


    {
        id: 1002,

        date: "2026-09-29",

        customer: {
            name: "Diego Martínez",
            email: "diego@gmail.com"
        },

        status: "Despachado",

        products: [

            {
                id: 5,
                name: "Plant Protein Vegan",
                price: 34990,
                quantity: 2
            }

        ]
    },


    {
        id: 1003,

        date: "2026-09-30",

        customer: {
            name: "Fernanda López",
            email: "fernanda@duoc.cl"
        },

        status: "Pendiente",

        products: [

            {
                id: 3,
                name: "Pre Workout Energy",
                price: 26990,
                quantity: 1
            },

            {
                id: 6,
                name: "Recovery Magnesium",
                price: 15990,
                quantity: 1
            }

        ]
    }

];