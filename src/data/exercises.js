/*
 * Datos iniciales y contenido.
 * Contiene los ocho ejercicios demostrativos con grupo muscular, dificultad, imagen y cantidades
 * sugeridas.
 */

// Construye la dirección de una imagen respecto a este módulo para que Vite pueda incluirla en
// producción.
const image = name => new URL(`../../assets/img/training/${name}.jpg`, import.meta.url).href;

// Mismos ejercicios, identificadores y sugerencias de la EP1.
export const exercises = [
    { id: 1, name: "Press de banca", muscle: "Pecho", difficulty: "Intermedio", equipment: "Barra", icon: "bi-person-arms-up", description: "Ejercicio compuesto orientado principalmente al trabajo de pectorales, tríceps y musculatura estabilizadora.", defaultSets: 4, defaultReps: 10, image: image("press-banca") },
    { id: 2, name: "Sentadilla", muscle: "Piernas", difficulty: "Intermedio", equipment: "Barra", icon: "bi-activity", description: "Movimiento compuesto orientado al trabajo del tren inferior, especialmente cuádriceps, glúteos y musculatura estabilizadora.", defaultSets: 4, defaultReps: 8, image: image("sentadilla") },
    { id: 3, name: "Remo con mancuerna", muscle: "Espalda", difficulty: "Intermedio", equipment: "Mancuernas", icon: "bi-arrow-left-right", description: "Ejercicio unilateral destinado al trabajo de la musculatura dorsal y estabilizadores de la espalda.", defaultSets: 3, defaultReps: 12, image: image("remo-mancuerna") },
    { id: 4, name: "Curl de bíceps", muscle: "Brazos", difficulty: "Principiante", equipment: "Mancuernas", icon: "bi-lightning", description: "Ejercicio de aislamiento orientado principalmente al trabajo de la musculatura flexora del brazo.", defaultSets: 3, defaultReps: 12, image: image("curl-biceps") },
    { id: 5, name: "Press militar", muscle: "Hombros", difficulty: "Intermedio", equipment: "Mancuernas", icon: "bi-arrow-up", description: "Movimiento de empuje vertical orientado al trabajo de hombros y tríceps.", defaultSets: 4, defaultReps: 10, image: image("press-militar") },
    { id: 6, name: "Plancha abdominal", muscle: "Core", difficulty: "Principiante", equipment: "Peso corporal", icon: "bi-dash-lg", description: "Ejercicio isométrico utilizado para trabajar estabilidad y control del core.", defaultSets: 3, defaultReps: 30, image: image("plancha-abdominal") },
    { id: 7, name: "Peso muerto rumano", muscle: "Piernas", difficulty: "Avanzado", equipment: "Barra", icon: "bi-chevron-double-down", description: "Movimiento dominante de cadera orientado a isquiotibiales, glúteos y musculatura posterior.", defaultSets: 4, defaultReps: 8, image: image("peso-muerto-rumano") },
    { id: 8, name: "Jalón al pecho", muscle: "Espalda", difficulty: "Principiante", equipment: "Polea", icon: "bi-arrow-down", description: "Ejercicio de tracción vertical destinado principalmente al trabajo del dorsal ancho.", defaultSets: 3, defaultReps: 12, image: image("jalon-pecho") }
];
