"use strict";

/* =========================================================
   KYNEX - REGISTRO DE USUARIO
========================================================= */

import {
    regions
} from "../data/regions.js";


import {
    cleanRun,
    isValidRun,
    isAllowedEmail,
    showFieldError,
    showFieldSuccess
} from "./validation.js";


import {
    getUsers
} from "./auth.js";


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const USERS_KEY =
    "kynex_users";


/* =========================================================
   FORMULARIO
========================================================= */

const form =
    document.getElementById(
        "register-form"
    );


const fields = {

    run:
        document.getElementById(
            "run"
        ),

    firstName:
        document.getElementById(
            "first-name"
        ),

    lastName:
        document.getElementById(
            "last-name"
        ),

    email:
        document.getElementById(
            "email"
        ),

    birthDate:
        document.getElementById(
            "birth-date"
        ),

    region:
        document.getElementById(
            "region"
        ),

    commune:
        document.getElementById(
            "commune"
        ),

    address:
        document.getElementById(
            "address"
        )

};


const messages = {

    run:
        document.getElementById(
            "run-message"
        ),

    firstName:
        document.getElementById(
            "first-name-message"
        ),

    lastName:
        document.getElementById(
            "last-name-message"
        ),

    email:
        document.getElementById(
            "email-message"
        ),

    region:
        document.getElementById(
            "region-message"
        ),

    commune:
        document.getElementById(
            "commune-message"
        ),

    address:
        document.getElementById(
            "address-message"
        )

};


const statusElement =
    document.getElementById(
        "register-status"
    );


/* =========================================================
   GUARDAR USUARIOS
========================================================= */

function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(
            users
        )
    );

}


/* =========================================================
   REGIONES
========================================================= */

function populateRegions() {

    regions.forEach(
        region => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                region.name;


            option.textContent =
                region.name;


            fields.region.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   COMUNAS
========================================================= */

function populateCommunes() {

    const selectedRegion =
        regions.find(
            region =>
                region.name ===
                fields.region.value
        );


    fields.commune.innerHTML =
        `
            <option value="">
                Selecciona una comuna
            </option>
        `;


    if (!selectedRegion) {

        fields.commune.disabled =
            true;

        return;

    }


    selectedRegion.communes.forEach(
        commune => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                commune;


            option.textContent =
                commune;


            fields.commune.appendChild(
                option
            );

        }
    );


    fields.commune.disabled =
        false;

}


/* =========================================================
   RUN
========================================================= */

function validateRun() {

    const value =
        cleanRun(
            fields.run.value
        );


    fields.run.value =
        value;


    if (!value) {

        showFieldError(
            fields.run,
            messages.run,
            "El RUN es obligatorio."
        );

        return false;

    }


    if (
        value.length < 7
        ||
        value.length > 9
    ) {

        showFieldError(
            fields.run,
            messages.run,
            "El RUN debe contener entre 7 y 9 caracteres."
        );

        return false;

    }


    if (
        !isValidRun(
            value
        )
    ) {

        showFieldError(
            fields.run,
            messages.run,
            "Ingresa un RUN válido, sin puntos ni guion."
        );

        return false;

    }


    const duplicated =
        getUsers().some(
            user =>
                cleanRun(
                    user.run || ""
                ) ===
                value
        );


    if (
        duplicated
    ) {

        showFieldError(
            fields.run,
            messages.run,
            "Ya existe un usuario registrado con este RUN."
        );

        return false;

    }


    showFieldSuccess(
        fields.run,
        messages.run
    );


    return true;

}


/* =========================================================
   NOMBRE
========================================================= */

function validateFirstName() {

    const value =
        fields.firstName.value
            .trim();


    if (!value) {

        showFieldError(
            fields.firstName,
            messages.firstName,
            "El nombre es obligatorio."
        );

        return false;

    }


    if (
        value.length > 50
    ) {

        showFieldError(
            fields.firstName,
            messages.firstName,
            "El nombre no puede superar 50 caracteres."
        );

        return false;

    }


    showFieldSuccess(
        fields.firstName,
        messages.firstName
    );


    return true;

}


/* =========================================================
   APELLIDOS
========================================================= */

function validateLastName() {

    const value =
        fields.lastName.value
            .trim();


    if (!value) {

        showFieldError(
            fields.lastName,
            messages.lastName,
            "Los apellidos son obligatorios."
        );

        return false;

    }


    if (
        value.length > 100
    ) {

        showFieldError(
            fields.lastName,
            messages.lastName,
            "Los apellidos no pueden superar 100 caracteres."
        );

        return false;

    }


    showFieldSuccess(
        fields.lastName,
        messages.lastName
    );


    return true;

}


/* =========================================================
   CORREO
========================================================= */

function validateEmail() {

    const value =
        fields.email.value
            .trim()
            .toLowerCase();


    if (!value) {

        showFieldError(
            fields.email,
            messages.email,
            "El correo electrónico es obligatorio."
        );

        return false;

    }


    if (
        value.length > 100
    ) {

        showFieldError(
            fields.email,
            messages.email,
            "El correo no puede superar 100 caracteres."
        );

        return false;

    }


    if (
        !isAllowedEmail(
            value
        )
    ) {

        showFieldError(
            fields.email,
            messages.email,
            "Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com."
        );

        return false;

    }


    const duplicated =
        getUsers().some(
            user =>
                user.email
                    ?.toLowerCase()
                ===
                value
        );


    if (
        duplicated
    ) {

        showFieldError(
            fields.email,
            messages.email,
            "Ya existe un usuario registrado con este correo."
        );

        return false;

    }


    showFieldSuccess(
        fields.email,
        messages.email
    );


    return true;

}


/* =========================================================
   REGIÓN
========================================================= */

function validateRegion() {

    if (
        !fields.region.value
    ) {

        showFieldError(
            fields.region,
            messages.region,
            "Selecciona una región."
        );

        return false;

    }


    showFieldSuccess(
        fields.region,
        messages.region
    );


    return true;

}


/* =========================================================
   COMUNA
========================================================= */

function validateCommune() {

    if (
        !fields.commune.value
    ) {

        showFieldError(
            fields.commune,
            messages.commune,
            "Selecciona una comuna."
        );

        return false;

    }


    showFieldSuccess(
        fields.commune,
        messages.commune
    );


    return true;

}


/* =========================================================
   DIRECCIÓN
========================================================= */

function validateAddress() {

    const value =
        fields.address.value
            .trim();


    if (!value) {

        showFieldError(
            fields.address,
            messages.address,
            "La dirección es obligatoria."
        );

        return false;

    }


    if (
        value.length > 300
    ) {

        showFieldError(
            fields.address,
            messages.address,
            "La dirección no puede superar 300 caracteres."
        );

        return false;

    }


    showFieldSuccess(
        fields.address,
        messages.address
    );


    return true;

}


/* =========================================================
   FORMULARIO COMPLETO
========================================================= */

function validateForm() {

    const results = [

        validateRun(),

        validateFirstName(),

        validateLastName(),

        validateEmail(),

        validateRegion(),

        validateCommune(),

        validateAddress()

    ];


    return results.every(
        Boolean
    );

}


/* =========================================================
   CREAR USUARIO
========================================================= */

function createUser() {

    const users =
        getUsers();


    const user = {

        id:
            Date.now(),

        run:
            cleanRun(
                fields.run.value
            ),

        firstName:
            fields.firstName.value
                .trim(),

        lastName:
            fields.lastName.value
                .trim(),

        email:
            fields.email.value
                .trim()
                .toLowerCase(),

        /*
         * Contraseña demostrativa.
         *
         * El formulario solicitado por el encargo
         * no incluye contraseña en el registro.
         */

        password:
            "1234",

        birthDate:
            fields.birthDate.value
            ||
            null,

        region:
            fields.region.value,

        commune:
            fields.commune.value,

        address:
            fields.address.value
                .trim(),

        role:
            "Cliente"

    };


    users.push(
        user
    );


    saveUsers(
        users
    );


    return user;

}


/* =========================================================
   EVENTOS
========================================================= */

fields.run.addEventListener(
    "blur",
    validateRun
);


fields.firstName.addEventListener(
    "blur",
    validateFirstName
);


fields.lastName.addEventListener(
    "blur",
    validateLastName
);


fields.email.addEventListener(
    "blur",
    validateEmail
);


fields.region.addEventListener(
    "change",
    () => {

        populateCommunes();

        validateRegion();

    }
);


fields.commune.addEventListener(
    "change",
    validateCommune
);


fields.address.addEventListener(
    "blur",
    validateAddress
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


        if (
            !validateForm()
        ) {

            statusElement.textContent =
                "Revisa los campos marcados antes de continuar.";


            statusElement.classList.add(
                "error"
            );


            return;

        }


        createUser();


        statusElement.textContent =
            "Usuario registrado correctamente. Para esta demostración, la contraseña inicial es 1234.";


        statusElement.classList.add(
            "success"
        );


        form.reset();


        fields.commune.innerHTML =
            `
                <option value="">
                    Selecciona primero una región
                </option>
            `;


        fields.commune.disabled =
            true;

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

populateRegions();