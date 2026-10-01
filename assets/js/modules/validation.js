"use strict"; // Activa el modo estricto para mejorar la seguridad y la depuración del código

/* =========================================================
   KYNEX - UTILIDADES DE VALIDACIÓN
========================================================= */


/* ---------------------------------------------------------
   EMAIL
--------------------------------------------------------- */

const allowedEmailDomains = [
    "duoc.cl",
    "profesor.duoc.cl",
    "gmail.com"
];


export function isAllowedEmail( // Verifica si un correo electrónico pertenece a un dominio permitido
    email
) {

    const normalized =
        email
            .trim()
            .toLowerCase();


    const emailPattern = // Expresión regular para validar el formato del correo electrónico
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            normalized
        )
    ) {

        return false;

    }


    const domain =
        normalized.split("@")[1];


    return allowedEmailDomains.includes(
        domain
    );

}


/* ---------------------------------------------------------
   RUN CHILENO
--------------------------------------------------------- */

export function cleanRun(run) { // Limpia el RUN eliminando puntos, guiones y espacios, y lo convierte a mayúsculas

    return run
        .replace(/\./g, "")
        .replace(/-/g, "")
        .trim()
        .toUpperCase();

}


export function isValidRun(run) {

    const cleaned =
        cleanRun(run);


    if (
        cleaned.length < 7 // Mínimo 7 dígitos (sin dígito verificador)
        ||
        cleaned.length > 9 // Máximo 9 dígitos (sin dígito verificador)
    ) {

        return false;

    }


    const body =
        cleaned.slice(0, -1); // Elimina el dígito verificador del RUN

    const verifier =
        cleaned.slice(-1); // Obtiene el dígito verificador del RUN


    if (!/^\d+$/.test(body)) {

        return false;

    }


    let sum = 
        0; // Suma acumulativa para el cálculo del dígito verificador

    let multiplier =
        2; // Multiplicador que se alterna entre 2 y 7


    for ( // Recorre los dígitos del cuerpo del RUN de derecha a izquierda y calcula la suma ponderada para el cálculo del dígito verificador
        let index =
            body.length - 1;

        index >= 0;

        index--
    ) {

        sum +=
            Number(body[index])
            *
            multiplier;


        multiplier =
            multiplier === 7
                ? 2
                : multiplier + 1;

    }


    const result = // Calcula el dígito verificador esperado a partir de la suma ponderada y el módulo 11
        11 - (sum % 11);


    let expectedVerifier;


    if (result === 11) {

        expectedVerifier =
            "0";

    } else if (result === 10) {

        expectedVerifier =
            "K";

    } else {

        expectedVerifier =
            String(result);

    }


    return verifier ===
        expectedVerifier;

}


/* ---------------------------------------------------------
   ESTADO VISUAL
--------------------------------------------------------- */

export function showFieldError( //  Muestra un mensaje de error y aplica estilos de error al campo de entrada
    input,
    messageElement,
    message
) {

    input.classList.remove(
        "is-valid"
    );

    input.classList.add(
        "is-invalid"
    );


    messageElement.textContent =
        message;

    messageElement.classList.remove(
        "success"
    );

    messageElement.classList.add(
        "error"
    );

}


export function showFieldSuccess( // Muestra un mensaje de éxito y aplica estilos de éxito al campo de entrada
    input,
    messageElement,
    message = ""
) {

    input.classList.remove( // Elimina la clase "is-invalid" del campo de entrada para indicar que no hay errores
        "is-invalid"
    );

    input.classList.add( // Agrega la clase "is-valid" al campo de entrada para indicar que la entrada es válida
        "is-valid"
    );


    messageElement.textContent = // Actualiza el contenido del elemento de mensaje con el mensaje proporcionado (puede estar vacío)
        message;

    messageElement.classList.remove(
        "error"
    );


    if (message) {

        messageElement.classList.add(
            "success"
        );

    } else {

        messageElement.classList.remove(
            "success"
        );

    }

}