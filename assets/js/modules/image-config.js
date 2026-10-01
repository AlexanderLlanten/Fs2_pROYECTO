"use strict";

/* =========================================================
   KYNEX - CONFIGURACIÓN DE IMÁGENES
========================================================= */


/* =========================================================
   RAÍZ DEL PROYECTO
========================================================= */

function getProjectBasePath() {

    const path =
        window.location.pathname;


    const lowerPath =
        path.toLowerCase();


    const markers = [
        "/pages/",
        "/admin/"
    ];


    for (
        const marker
        of markers
    ) {

        const position =
            lowerPath.indexOf(
                marker
            );


        if (
            position !== -1
        ) {

            return path.substring(
                0,
                position
            );

        }

    }


    const lastSlash =
        path.lastIndexOf("/");


    if (
        lastSlash <= 0
    ) {

        return "";

    }


    return path.substring(
        0,
        lastSlash
    );

}


/* =========================================================
   RESOLVER RUTA
========================================================= */

export function resolveAssetPath(
    relativePath
) {

    if (!relativePath) {

        return "";

    }


    /*
     * URL externa
     */

    if (
        relativePath.startsWith(
            "http://"
        )
        ||
        relativePath.startsWith(
            "https://"
        )
        ||
        relativePath.startsWith(
            "data:"
        )
    ) {

        return relativePath;

    }


    const cleanPath =
        relativePath.replace(
            /^\/+/,
            ""
        );


    const basePath =
        getProjectBasePath();


    return `${basePath}/${cleanPath}`;

}


/* =========================================================
   PRODUCTOS
========================================================= */

const productImages = {

    KYN001:
        "assets/img/products/kynex-whey-protein-vanilla.png",

    KYN002:
        "assets/img/products/kynex-creatina-monohidratada-unflavored.png",

    KYN003:
        "assets/img/products/kynex-pre-workout-energy-fruit-punch.png",

    KYN004:
        "assets/img/products/kynex-multivitaminico-daily.png",

    KYN005:
        "assets/img/products/kynex-plant-protein-vegan-chocolate.png",

    KYN006:
        "assets/img/products/kynex-recovery-magnesium-natural-citrus.png"

};


/* =========================================================
   OBTENER IMAGEN PRODUCTO
========================================================= */

export function getProductImage(
    product
) {

    /*
     * Primero se respeta una imagen personalizada
     * creada desde Administración.
     */

    if (
        product?.image
        &&
        product.image.trim() !== ""
    ) {

        return resolveAssetPath(
            product.image
        );

    }


    /*
     * Productos originales KYNEX.
     */

    const image =
        productImages[
            product?.code
        ];


    if (!image) {

        return "";

    }


    return resolveAssetPath(
        image
    );

}


/* =========================================================
   EJERCICIOS
========================================================= */

const exerciseImages = {

    1:
        "assets/img/training/press-banca.jpg",

    2:
        "assets/img/training/sentadilla.jpg",

    3:
        "assets/img/training/remo-mancuerna.jpg",

    4:
        "assets/img/training/curl-biceps.jpg",

    5:
        "assets/img/training/press-militar.jpg",

    6:
        "assets/img/training/plancha-abdominal.jpg",

    7:
        "assets/img/training/peso-muerto-rumano.jpg",

    8:
        "assets/img/training/jalon-pecho.jpg"

};


/* =========================================================
   OBTENER IMAGEN EJERCICIO
========================================================= */

export function getExerciseImage(
    exercise
) {

    const image =
        exerciseImages[
            exercise?.id
        ];


    if (!image) {

        return "";

    }


    return resolveAssetPath(
        image
    );

}