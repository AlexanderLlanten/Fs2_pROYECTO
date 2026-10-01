"use strict";

/* =========================================================
   KYNEX - AUTENTICACIÓN FRONT END
========================================================= */

import {
    defaultUsers
} from "../data/users.js";


const USERS_KEY =
    "kynex_users";


const SESSION_KEY =
    "kynex_session";


/* =========================================================
   USUARIOS
========================================================= */

export function getUsers() {

    const stored =
        localStorage.getItem(
            USERS_KEY
        );


    if (!stored) {

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(
                defaultUsers
            )
        );


        return [
            ...defaultUsers
        ];

    }


    try {

        const users =
            JSON.parse(
                stored
            );


        return Array.isArray(users)
            ? users
            : [];

    } catch (error) {

        console.error(
            "No fue posible leer los usuarios.",
            error
        );


        return [];

    }

}


/* =========================================================
   SESIÓN
========================================================= */

export function getSession() {

    const stored =
        localStorage.getItem(
            SESSION_KEY
        );


    if (!stored) {

        return null;

    }


    try {

        const session =
            JSON.parse(
                stored
            );


        if (
            !session
            ||
            typeof session !== "object"
            ||
            !session.email
            ||
            !session.role
        ) {

            return null;

        }


        return session;

    } catch (error) {

        console.error(
            "No fue posible leer la sesión.",
            error
        );


        return null;

    }

}


/* =========================================================
   GUARDAR SESIÓN
========================================================= */

function saveSession(user) {

    const session = {

        id:
            user.id,

        firstName:
            user.firstName,

        lastName:
            user.lastName,

        email:
            user.email,

        role:
            user.role

    };


    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(
            session
        )
    );


    return session;

}


/* =========================================================
   LOGIN
========================================================= */

export function loginUser(
    email,
    password
) {

    const normalizedEmail =
        email
            .trim()
            .toLowerCase();


    const users =
        getUsers();


    const user =
        users.find(
            item =>
                item.email
                    ?.toLowerCase()
                ===
                normalizedEmail
        );


    if (!user) {

        return {
            success: false,
            message:
                "No existe un usuario registrado con este correo."
        };

    }


    /*
     * Autenticación demostrativa Front End.
     *
     * Si el usuario no posee contraseña almacenada,
     * se utiliza 1234 como contraseña de demostración.
     *
     * Esto NO representa seguridad real de producción.
     */

    const storedPassword =
        user.password
        ||
        "1234";


    if (
        storedPassword !==
        password
    ) {

        return {
            success: false,
            message:
                "La contraseña ingresada no es correcta."
        };

    }


    const session =
        saveSession(
            user
        );


    return {

        success:
            true,

        session:
            session

    };

}


/* =========================================================
   LOGOUT
========================================================= */

export function logoutUser() {

    localStorage.removeItem(
        SESSION_KEY
    );

}


/* =========================================================
   ROLES
========================================================= */

export function isAdmin() {

    return getSession()?.role ===
        "Administrador";

}


export function isSeller() {

    return getSession()?.role ===
        "Vendedor";

}


export function isClient() {

    return getSession()?.role ===
        "Cliente";

}


export function hasRole(
    ...roles
) {

    const session =
        getSession();


    if (!session) {

        return false;

    }


    return roles.includes(
        session.role
    );

}