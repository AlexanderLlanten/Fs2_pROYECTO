"use strict";

/* =========================================================
   KYNEX - BIBLIOTECA DE EJERCICIOS
========================================================= */

import {
    exercises
} from "../data/exercises.js";


import {
    getExerciseImage
} from "./image-config.js";


const ROUTINE_KEY =
    "kynex_routine";


/* =========================================================
   DOM
========================================================= */

const container =
    document.getElementById(
        "exercise-container"
    );


const searchInput =
    document.getElementById(
        "exercise-search"
    );


const muscleFilter =
    document.getElementById(
        "muscle-filter"
    );


const difficultyFilter =
    document.getElementById(
        "difficulty-filter"
    );


const countElement =
    document.getElementById(
        "exercise-count"
    );


const emptyState =
    document.getElementById(
        "exercise-empty"
    );


/* =========================================================
   LOCAL STORAGE
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
   AGREGAR A RUTINA
========================================================= */

function addExerciseToRoutine(
    exerciseId
) {

    const exercise =
        exercises.find(
            item =>
                item.id ===
                exerciseId
        );


    if (!exercise) {

        return;

    }


    const routine =
        getRoutine();


    const exists =
        routine.some(
            item =>
                item.id ===
                exercise.id
        );


    if (
        exists
    ) {

        window.alert(
            "Este ejercicio ya está agregado a tu rutina."
        );


        return;

    }


    routine.push(
        {
            id:
                exercise.id,

            sets:
                exercise.defaultSets,

            reps:
                exercise.defaultReps
        }
    );


    saveRoutine(
        routine
    );


    window.alert(
        `${exercise.name} fue agregado a tu rutina.`
    );

}


/* =========================================================
   IMAGEN
========================================================= */

function createExerciseImage(
    exercise
) {

    const image =
        getExerciseImage(
            exercise
        );


    if (!image) {

        return `
            <div class="exercise-image-fallback">

                <i
                    class="bi ${exercise.icon || "bi-activity"}"
                    aria-hidden="true"
                ></i>

            </div>
        `;

    }


    return `
        <img
            src="${image}"
            alt="${exercise.name}"
            class="exercise-image"
            loading="lazy"
        >
    `;

}


/* =========================================================
   TARJETA
========================================================= */

function createExerciseCard(
    exercise
) {

    return `
        <article class="exercise-card">

            <div class="exercise-card-image">

                ${createExerciseImage(
                    exercise
                )}

            </div>


            <div class="exercise-card-content">

                <div class="exercise-card-meta">

                    <span class="exercise-badge">
                        ${exercise.muscle}
                    </span>

                    <span class="exercise-badge">
                        ${exercise.difficulty}
                    </span>

                    <span class="exercise-badge">
                        ${exercise.equipment}
                    </span>

                </div>


                <h2>
                    ${exercise.name}
                </h2>


                <p>
                    ${exercise.description}
                </p>


                <div class="exercise-prescription">

                    Sugerencia:

                    <strong>
                        ${exercise.defaultSets}
                        series ×
                        ${exercise.defaultReps}
                    </strong>

                </div>


                <button
                    type="button"
                    class="btn btn-kynex-primary add-exercise"
                    data-exercise-id="${exercise.id}"
                >

                    <i class="bi bi-plus-lg"></i>

                    Agregar a mi rutina

                </button>

            </div>

        </article>
    `;

}


/* =========================================================
   RENDER
========================================================= */

function renderExercises(
    exerciseList
) {

    container.innerHTML =
        exerciseList
            .map(
                createExerciseCard
            )
            .join("");


    countElement.textContent =
        exerciseList.length === 1
            ? "1 ejercicio encontrado"
            : `${exerciseList.length} ejercicios encontrados`;


    emptyState.classList.toggle(
        "d-none",
        exerciseList.length !== 0
    );

}


/* =========================================================
   FILTROS
========================================================= */

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const muscle =
        muscleFilter.value;


    const difficulty =
        difficultyFilter.value;


    const filtered =
        exercises.filter(
            exercise => {

                const matchesSearch =
                    exercise.name
                        .toLowerCase()
                        .includes(
                            search
                        )
                    ||
                    exercise.description
                        .toLowerCase()
                        .includes(
                            search
                        );


                const matchesMuscle =
                    muscle === "all"
                    ||
                    exercise.muscle ===
                        muscle;


                const matchesDifficulty =
                    difficulty === "all"
                    ||
                    exercise.difficulty ===
                        difficulty;


                return (
                    matchesSearch
                    &&
                    matchesMuscle
                    &&
                    matchesDifficulty
                );

            }
        );


    renderExercises(
        filtered
    );

}


/* =========================================================
   EVENTOS
========================================================= */

searchInput.addEventListener(
    "input",
    applyFilters
);


muscleFilter.addEventListener(
    "change",
    applyFilters
);


difficultyFilter.addEventListener(
    "change",
    applyFilters
);


container.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".add-exercise"
            );


        if (!button) {

            return;

        }


        addExerciseToRoutine(
            Number(
                button.dataset.exerciseId
            )
        );

    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

renderExercises(
    exercises
);