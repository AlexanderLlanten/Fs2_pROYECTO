"use strict";

/* =========================================================
   KYNEX - FORMULARIO ADMINISTRATIVO DE USUARIOS
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
   STORAGE
========================================================= */

const USERS_KEY =
    "kynex_users";


/* =========================================================
   PARÁMETROS URL
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const editingId =
    Number(
        params.get("id")
    );


const isEditing =
    Number.isInteger(
        editingId
    )
    &&
    editingId > 0;


/* =========================================================
   FORMULARIO
========================================================= */

const form =
    document.getElementById(
        "admin-user-form"
    );


const fields = {

    run:
        document.getElementById(
            "admin-run"
        ),

    firstName:
        document.getElementById(
            "admin-first-name"
        ),

    lastName:
        document.getElementById(
            "admin-last-name"
        ),

    email:
        document.getElementById(
            "admin-email"
        ),

    birthDate:
        document.getElementById(
            "admin-birth-date"
        ),

    role:
        document.getElementById(
            "admin-role"
        ),

    region:
        document.getElementById(
            "admin-region"
        ),

    commune:
        document.getElementById(
            "admin-commune"
        ),

    address:
        document.getElementById(
            "admin-address"
        )

};


const messages = {

    run:
        document.getElementById(
            "admin-run-message"
        ),

    firstName:
        document.getElementById(
            "admin-first-name-message"
        ),

    lastName:
        document.getElementById(
            "admin-last-name-message"
        ),

    email:
        document.getElementById(
            "admin-email-message"
        ),

    role:
        document.getElementById(
            "admin-role-message"
        ),

    region:
        document.getElementById(
            "admin-region-message"
        ),

    commune:
        document.getElementById(
            "admin-commune-message"
        ),

    address:
        document.getElementById(
            "admin-address-message"
        )

};


const statusElement =
    document.getElementById(
        "admin-user-status"
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
   USUARIO ACTUAL
========================================================= */

function getEditingUser() {

    if (!isEditing) {

        return null;

    }


    return (
        getUsers().find(
            user =>
                user.id ===
                editingId
        )
        ||
        null
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

function populateCommunes(
    regionName,
    selectedCommune = ""
) {

    const region =
        regions.find(
            item =>
                item.name ===
                regionName
        );


    fields.commune.innerHTML =
        `
            <option value="">
                Selecciona una comuna
            </option>
        `;


    if (!region) {

        fields.commune.disabled =
            true;

        return;

    }


    region.communes.forEach(
        commune => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                commune;


            option.textContent =
                commune;


            if (
                commune ===
                selectedCommune
            ) {

                option.selected =
                    true;

            }


            fields.commune.appendChild(
                option
            );

        }
    );


    fields.commune.disabled =
        false;

}


/* =========================================================
   VALIDAR RUN
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
            "El RUN debe tener entre 7 y 9 caracteres."
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
                )
                ===
                value
                &&
                user.id !==
                    editingId
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
   VALIDAR NOMBRE
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
            "El nombre no puede superar los 50 caracteres."
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
   VALIDAR APELLIDOS
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
            "Los apellidos no pueden superar los 100 caracteres."
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
   VALIDAR CORREO
========================================================= */

function validateEmail() {

    const value =
        fields.email.value
            .trim()
            .toLowerCase();


    fields.email.value =
        value;


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
            "El correo no puede superar los 100 caracteres."
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
                    ?.trim()
                    .toLowerCase()
                ===
                value
                &&
                user.id !==
                    editingId
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
   VALIDAR ROL
========================================================= */

function validateRole() {

    const allowedRoles = [
        "Administrador",
        "Cliente",
        "Vendedor"
    ];


    if (
        !allowedRoles.includes(
            fields.role.value
        )
    ) {

        showFieldError(
            fields.role,
            messages.role,
            "Selecciona un tipo de usuario válido."
        );

        return false;

    }


    showFieldSuccess(
        fields.role,
        messages.role
    );


    return true;

}


/* =========================================================
   VALIDAR REGIÓN
========================================================= */

function validateRegion() {

    const exists =
        regions.some(
            region =>
                region.name ===
                fields.region.value
        );


    if (!exists) {

        showFieldError(
            fields.region,
            messages.region,
            "Selecciona una región válida."
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
   VALIDAR COMUNA
========================================================= */

function validateCommune() {

    const region =
        regions.find(
            item =>
                item.name ===
                fields.region.value
        );


    const validCommune =
        region
        &&
        region.communes.includes(
            fields.commune.value
        );


    if (
        !validCommune
    ) {

        showFieldError(
            fields.commune,
            messages.commune,
            "Selecciona una comuna válida."
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
   VALIDAR DIRECCIÓN
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
            "La dirección no puede superar los 300 caracteres."
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
   VALIDAR FORMULARIO COMPLETO
========================================================= */

function validateForm() {

    const validations = [

        validateRun(),

        validateFirstName(),

        validateLastName(),

        validateEmail(),

        validateRole(),

        validateRegion(),

        validateCommune(),

        validateAddress()

    ];


    return validations.every(
        Boolean
    );

}


/* =========================================================
   CARGAR USUARIO
========================================================= */

function loadUser() {

    if (!isEditing) {

        return;

    }


    const user =
        getEditingUser();


    if (!user) {

        statusElement.className =
            "form-status error";


        statusElement.textContent =
            "No fue posible encontrar el usuario solicitado.";

        return;

    }


    document.getElementById(
        "user-form-title"
    ).textContent =
        "Editar usuario";


    fields.run.value =
        user.run || "";


    fields.firstName.value =
        user.firstName || "";


    fields.lastName.value =
        user.lastName || "";


    fields.email.value =
        user.email || "";


    fields.birthDate.value =
        user.birthDate || "";


    fields.role.value =
        user.role || "";


    fields.region.value =
        user.region || "";


    populateCommunes(
        user.region,
        user.commune
    );


    fields.address.value =
        user.address || "";

}


/* =========================================================
   CONSTRUIR USUARIO
========================================================= */

function buildUserData() {

    const currentUser =
        getEditingUser();


    return {

        id:
            isEditing
                ? editingId
                : Date.now(),

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

        password:
            currentUser?.password
            ||
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
            fields.role.value

    };

}


/* =========================================================
   GUARDAR
========================================================= */

function saveUser() {

    const users =
        getUsers();


    const userData =
        buildUserData();


    if (
        isEditing
    ) {

        const index =
            users.findIndex(
                user =>
                    user.id ===
                    editingId
            );


        if (
            index === -1
        ) {

            statusElement.className =
                "form-status error";


            statusElement.textContent =
                "No fue posible encontrar el usuario que se intenta editar.";

            return;

        }


        users[index] =
            userData;

    } else {

        users.push(
            userData
        );

    }


    saveUsers(
        users
    );


    statusElement.className =
        "form-status success";


    statusElement.textContent =
        isEditing
            ? "Usuario actualizado correctamente."
            : "Usuario creado correctamente.";


    window.setTimeout(
        () => {

            window.location.href =
                "users.html";

        },
        700
    );

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


fields.role.addEventListener(
    "change",
    validateRole
);


fields.region.addEventListener(
    "change",
    () => {

        populateCommunes(
            fields.region.value
        );


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


        statusElement.textContent =
            "";


        if (
            !validateForm()
        ) {

            statusElement.className =
                "form-status error";


            statusElement.textContent =
                "Revisa los campos marcados antes de guardar el usuario.";


            return;

        }


        saveUser();

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

populateRegions();

loadUser();