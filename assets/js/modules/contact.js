"use strict";

/* =========================================================
   KYNEX - CONTACTO
========================================================= */

import {
    isAllowedEmail,
    showFieldError,
    showFieldSuccess
} from "./validation.js";


const form =
    document.getElementById(
        "contact-form"
    );

const nameInput =
    document.getElementById(
        "contact-name"
    );

const emailInput =
    document.getElementById(
        "contact-email"
    );

const commentInput =
    document.getElementById(
        "contact-comment"
    );


const nameMessage =
    document.getElementById(
        "contact-name-message"
    );

const emailMessage =
    document.getElementById(
        "contact-email-message"
    );

const commentMessage =
    document.getElementById(
        "contact-comment-message"
    );

const counter =
    document.getElementById(
        "comment-counter"
    );

const statusElement =
    document.getElementById(
        "contact-status"
    );


/* =========================================================
   NOMBRE
========================================================= */

function validateName() {

    const value =
        nameInput.value.trim();


    if (!value) {

        showFieldError(
            nameInput,
            nameMessage,
            "El nombre es obligatorio."
        );

        return false;

    }


    if (value.length > 100) {

        showFieldError(
            nameInput,
            nameMessage,
            "El nombre no puede superar 100 caracteres."
        );

        return false;

    }


    showFieldSuccess(
        nameInput,
        nameMessage
    );

    return true;

}


/* =========================================================
   EMAIL
========================================================= */

function validateEmail() {

    const value =
        emailInput.value.trim();


    if (!value) {

        showFieldError(
            emailInput,
            emailMessage,
            "El correo electrónico es obligatorio."
        );

        return false;

    }


    if (value.length > 100) {

        showFieldError(
            emailInput,
            emailMessage,
            "El correo no puede superar 100 caracteres."
        );

        return false;

    }


    if (!isAllowedEmail(value)) {

        showFieldError(
            emailInput,
            emailMessage,
            "Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."
        );

        return false;

    }


    showFieldSuccess(
        emailInput,
        emailMessage
    );

    return true;

}


/* =========================================================
   COMENTARIO
========================================================= */

function validateComment() {

    const value =
        commentInput.value.trim();


    if (!value) {

        showFieldError(
            commentInput,
            commentMessage,
            "El comentario es obligatorio."
        );

        return false;

    }


    if (value.length > 500) {

        showFieldError(
            commentInput,
            commentMessage,
            "El comentario no puede superar 500 caracteres."
        );

        return false;

    }


    showFieldSuccess(
        commentInput,
        commentMessage
    );

    return true;

}


/* =========================================================
   CONTADOR
========================================================= */

function updateCounter() {

    counter.textContent =
        `${commentInput.value.length} / 500`;

}


/* =========================================================
   EVENTOS
========================================================= */

nameInput.addEventListener(
    "blur",
    validateName
);


emailInput.addEventListener(
    "blur",
    validateEmail
);


commentInput.addEventListener(
    "input",
    () => {

        updateCounter();

        if (
            commentInput.value.length >
            0
        ) {

            validateComment();

        }

    }
);


/* =========================================================
   SUBMIT
========================================================= */

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        statusElement.className =
            "form-status";


        const validations = [

            validateName(),

            validateEmail(),

            validateComment()

        ];


        if (
            !validations.every(Boolean)
        ) {

            statusElement.textContent =
                "Revisa los campos marcados antes de enviar.";

            statusElement.classList.add(
                "error"
            );

            return;

        }


        statusElement.textContent =
            "Mensaje validado correctamente.";

        statusElement.classList.add(
            "success"
        );

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

updateCounter();