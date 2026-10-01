"use strict";

/* =========================================================
   KYNEX - MI RUTINA
========================================================= */

import {
    exercises
} from "../data/exercises.js";


const ROUTINE_KEY =
    "kynex_routine";


/* =========================================================
   DOM
========================================================= */

const container =
    document.getElementById(
        "routine-container"
    );


const emptyState =
    document.getElementById(
        "routine-empty"
    );


const exerciseCount =
    document.getElementById(
        "routine-exercise-count"
    );


const totalSets =
    document.getElementById(
        "routine-total-sets"
    );


const clearButton =
    document.getElementById(
        "clear-routine"
    );


/* =========================================================
   STORAGE
========================================================= */

function getRoutine() {

    const stored =
        localStorage.getItem(
            ROUTINE_KEY
        );


    if (!stored) {

        return [];

    }


    try {

        const routine =
            JSON.parse(
                stored
            );


        return Array.isArray(
            routine
        )
            ? routine
            : [];

    } catch (error) {

        console.error(
            "No fue posible leer la rutina.",
            error
        );


        return [];

    }

}


function saveRoutine(
    routine
) {

    localStorage.setItem(
        ROUTINE_KEY,
        JSON.stringify(
            routine
        )
    );

}


/* =========================================================
   DETALLE
========================================================= */

function getDetailedRoutine() {

    return getRoutine()
        .map(
            item => {

                const exercise =
                    exercises.find(
                        exercise =>
                            exercise.id ===
                            item.id
                    );


                if (!exercise) {

                    return null;

                }


                return {

                    ...exercise,

                    sets:
                        Number(
                            item.sets
                        )
                        ||
                        exercise.defaultSets,

                    reps:
                        Number(
                            item.reps
                        )
                        ||
                        exercise.defaultReps

                };

            }
        )
        .filter(Boolean);

}


/* =========================================================
   ITEM
========================================================= */

function createRoutineItem(
    exercise
) {

    return `
        <article
            class="routine-item"
            data-exercise-id="${exercise.id}"
        >

            <div>

                <h3>
                    ${exercise.name}
                </h3>

                <p>
                    ${exercise.muscle}
                    ·
                    ${exercise.equipment}
                </p>

            </div>


            <div class="routine-number">

                <label>
                    Series
                </label>

                <input
                    type="number"
                    min="1"
                    max="20"
                    value="${exercise.sets}"
                    class="routine-sets"
                    data-exercise-id="${exercise.id}"
                >

            </div>


            <div class="routine-number">

                <label>
                    Repeticiones
                </label>

                <input
                    type="number"
                    min="1"
                    max="100"
                    value="${exercise.reps}"
                    class="routine-reps"
                    data-exercise-id="${exercise.id}"
                >

            </div>


            <button
                type="button"
                class="routine-remove"
                data-exercise-id="${exercise.id}"
                aria-label="Eliminar ${exercise.name}"
            >

                <i class="bi bi-trash"></i>

            </button>

        </article>
    `;

}


/* =========================================================
   RESUMEN
========================================================= */

function updateSummary(
    routine
) {

    exerciseCount.textContent =
        routine.length;


    totalSets.textContent =
        routine.reduce(
            (total, exercise) =>
                total +
                exercise.sets,
            0
        );

}


/* =========================================================
   RENDER
========================================================= */

function renderRoutine() {

    const routine =
        getDetailedRoutine();


    if (
        routine.length === 0
    ) {

        container.innerHTML =
            "";


        emptyState.classList.remove(
            "d-none"
        );


        clearButton.classList.add(
            "d-none"
        );


        updateSummary(
            []
        );


        return;

    }


    emptyState.classList.add(
        "d-none"
    );


    clearButton.classList.remove(
        "d-none"
    );


    container.innerHTML =
        routine
            .map(
                createRoutineItem
            )
            .join("");


    updateSummary(
        routine
    );

}


/* =========================================================
   ACTUALIZAR
========================================================= */

function updateExercise(
    exerciseId,
    property,
    value
) {

    const routine =
        getRoutine();


    const item =
        routine.find(
            exercise =>
                exercise.id ===
                exerciseId
        );


    if (!item) {

        return;

    }


    item[property] =
        value;


    saveRoutine(
        routine
    );


    renderRoutine();

}


/* =========================================================
   ELIMINAR
========================================================= */

function removeExercise(
    exerciseId
) {

    const routine =
        getRoutine();


    const updated =
        routine.filter(
            exercise =>
                exercise.id !==
                exerciseId
        );


    saveRoutine(
        updated
    );


    renderRoutine();

}


/* =========================================================
   EVENTOS
========================================================= */

container.addEventListener(
    "change",
    event => {

        const setsInput =
            event.target.closest(
                ".routine-sets"
            );


        const repsInput =
            event.target.closest(
                ".routine-reps"
            );


        if (
            setsInput
        ) {

            const value =
                Math.max(
                    1,
                    Number(
                        setsInput.value
                    ) || 1
                );


            updateExercise(
                Number(
                    setsInput.dataset.exerciseId
                ),
                "sets",
                value
            );


            return;

        }


        if (
            repsInput
        ) {

            const value =
                Math.max(
                    1,
                    Number(
                        repsInput.value
                    ) || 1
                );


            updateExercise(
                Number(
                    repsInput.dataset.exerciseId
                ),
                "reps",
                value
            );

        }

    }
);


container.addEventListener(
    "click",
    event => {

        const removeButton =
            event.target.closest(
                ".routine-remove"
            );


        if (!removeButton) {

            return;

        }


        removeExercise(
            Number(
                removeButton.dataset.exerciseId
            )
        );

    }
);


clearButton.addEventListener(
    "click",
    () => {

        const confirmed =
            window.confirm(
                "¿Deseas eliminar todos los ejercicios de tu rutina?"
            );


        if (!confirmed) {

            return;

        }


        localStorage.removeItem(
            ROUTINE_KEY
        );


        renderRoutine();

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

renderRoutine();