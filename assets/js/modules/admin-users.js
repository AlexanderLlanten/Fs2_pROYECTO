"use strict";

/* =========================================================
   KYNEX - ADMINISTRACIÓN DE USUARIOS
========================================================= */

import {
    getUsers,
    getSession
} from "./auth.js";


/* =========================================================
   STORAGE
========================================================= */

const USERS_KEY =
    "kynex_users";


/* =========================================================
   ELEMENTOS
========================================================= */

const tableBody =
    document.getElementById(
        "users-table-body"
    );


const emptyState =
    document.getElementById(
        "users-empty"
    );


const session =
    getSession();


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
   ESCAPAR TEXTO
========================================================= */

function escapeHtml(value = "") { // Escapa caracteres especiales en una cadena para prevenir inyecciones de HTML

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CREAR FILA
========================================================= */

function createUserRow(user) { // Crea una fila de tabla HTML para un usuario dado

    const isCurrentUser =
        session?.id ===
        user.id;


    return `
        <tr>

            <td>
                ${escapeHtml(
                    user.run || "-"
                )}
            </td>


            <td>

                <strong>
                    ${escapeHtml(
                        user.firstName || ""
                    )}

                    ${escapeHtml(
                        user.lastName || ""
                    )}
                </strong>

            </td>


            <td>
                ${escapeHtml(
                    user.email || "-"
                )}
            </td>


            <td>
                ${escapeHtml(
                    user.region || "-"
                )}
            </td>


            <td>
                ${escapeHtml(
                    user.commune || "-"
                )}
            </td>


            <td>

                <span class="role-badge">
                    ${escapeHtml(
                        user.role || "-"
                    )}
                </span>

            </td>


            <td>

                <div class="admin-actions">

                    <a
                        href="user-form.html?id=${user.id}"
                        class="admin-action-button"
                        aria-label="Editar usuario"
                        title="Editar usuario"
                    >

                        <i class="bi bi-pencil"></i>

                    </a>


                    ${
                        !isCurrentUser
                            ? `
                                <button
                                    type="button"
                                    class="
                                        admin-action-button
                                        delete
                                        user-delete
                                    "
                                    data-user-id="${user.id}"
                                    aria-label="Eliminar usuario"
                                    title="Eliminar usuario"
                                >

                                    <i class="bi bi-trash"></i>

                                </button>
                            `
                            : `
                                <span
                                    class="role-badge"
                                    title="Usuario actualmente conectado"
                                >
                                    Sesión actual
                                </span>
                            `
                    }

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   RENDERIZAR USUARIOS
========================================================= */

function renderUsers() { // Renderiza la lista de usuarios en la tabla

    const users =
        getUsers();


    if (
        users.length === 0
    ) {

        tableBody.innerHTML =
            "";


        emptyState.classList.remove(
            "d-none"
        );


        return;

    }


    emptyState.classList.add(
        "d-none"
    );


    tableBody.innerHTML =
        users
            .map(
                createUserRow
            )
            .join("");

}


/* =========================================================
   ELIMINAR USUARIO 
========================================================= */

function deleteUser(userId) { // Elimina un usuario por su ID

    const users =
        getUsers();


    const user =
        users.find(
            item =>
                item.id ===
                userId
        );


    if (!user) {

        return;

    }


    /*
     * Evita eliminar el usuario que
     * mantiene la sesión administrativa.
     */

    if (
        session?.id ===
        userId
    ) {

        window.alert(
            "No es posible eliminar el usuario que mantiene la sesión activa."
        );

        return;

    }


    const updatedUsers =
        users.filter(
            item =>
                item.id !==
                userId
        );


    saveUsers(
        updatedUsers
    );


    renderUsers();

}


/* =========================================================
   EVENT DELEGATION
========================================================= */

tableBody?.addEventListener( // Delegación de eventos para manejar la eliminación de usuarios mediante un solo listener en el tbody de la tabla
    "click",
    event => {

        const deleteButton =
            event.target.closest(
                ".user-delete"
            );


        if (!deleteButton) {

            return;

        }


        const userId =
            Number(
                deleteButton.dataset.userId
            );


        const user =
            getUsers().find(
                item =>
                    item.id ===
                    userId
            );


        if (!user) {

            return;

        }


        const confirmed =
            window.confirm(
                `¿Deseas eliminar a ${user.firstName} ${user.lastName}?`
            );


        if (!confirmed) {

            return;

        }


        deleteUser(
            userId
        );

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

renderUsers();