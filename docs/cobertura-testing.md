# Cobertura de testing de KYNEX

Evaluación Parcial 2 de DSY1104 · Full Stack 2
Alexander Llantén Sepúlveda · 26 de octubre de 2026

La migración Front End aprobó 597 pruebas en 80 archivos, sin fallos ni omisiones, en un clon nuevo del repositorio público. Este informe documenta el proceso, diez casos representativos, la cobertura de código y las comprobaciones de navegador que acompañan la entrega.

## Resultado del corte

| Comprobación | Resultado |
| --- | --- |
| Instalación reproducible | npm ci correcto en un clon limpio |
| Pruebas automatizadas | 597 aprobadas · 0 fallidas · 0 omitidas |
| Archivos y duración | 80 archivos · 150,02 segundos |
| Producción | npm run build correcto |
| Navegador | 66 revisiones de rutas y tamaños; alcance detallado en la auditoría |

## Cobertura medida

| Métrica | Cubierto sobre total | Porcentaje |
| --- | --- | --- |
| Sentencias | 1314 / 1342 | 97,91% |
| Ramas | 1047 / 1106 | 94,66% |
| Funciones | 431 / 434 | 99,30% |
| Líneas | 1077 / 1088 | 98,98% |

La cobertura describe ejecución del código instrumentado. No es un porcentaje de migración, de requisitos satisfechos ni una garantía de ausencia de defectos.

## Identificación de la evidencia

Rama feature/react-migration. La suite se ejecutó sobre a4c13bc. El ajuste visual posterior 55f03c3 modifica únicamente CSS. Se comprobó la igualdad del contenido JS/JSX, package.json, package-lock.json y vite.config.js entre ambos cortes, normalizando LF/CRLF; se recompiló y revisó la corrección en navegador.

Entorno observado: Windows, Node.js 24.22.1, npm 11.19.1, Vitest 5.0.5, jsdom 30.1.3 y Vite 8.3.5. La pauta menciona Jasmine y Karma; Vitest fue autorizado por el docente según confirmación del estudiante.

## Proceso y distribución de las pruebas

Vitest ejecuta los casos con jsdom y React Testing Library. userEvent simula acciones y jest-dom aporta aserciones legibles. MemoryRouter permite comprobar navegación sin servidor. Los casos de integración montan proveedores y rutas reales; las pruebas de servicios y utilidades aíslan reglas de negocio y almacenamiento.

Los casos siguen preparación, acción y comprobación. Los conjuntos que dependen de persistencia reinician LocalStorage; los spies se restauran después de su uso. La configuración limita maxWorkers a 2 para reducir competencia de CPU y memoria y conserva el límite de 5 segundos por prueba y el aislamiento entre archivos.

| Grupo de archivos | Archivos | Pruebas |
| --- | --- | --- |
| src (integración) | 11 | 169 |
| atoms | 7 | 21 |
| molecules | 12 | 34 |
| organisms | 20 | 80 |
| templates | 2 | 5 |
| context | 3 | 27 |
| pages | 8 | 35 |
| routes | 1 | 15 |
| services | 6 | 115 |
| utils | 10 | 96 |

## Uso de mocks

vi.fn registra callbacks sin depender de efectos externos. Los spies de Storage.prototype fuerzan errores de lectura o escritura y verifican que la aplicación no borre información ni deje cambios parciales. Otros casos controlan Date para datos deterministas. Estos dobles se usan donde permiten observar un contrato o reproducir un fallo.

src/test/setup.js reemplaza scrollTo e implementa la apertura y cierre mínimos de dialog, capacidades que jsdom no reproduce como un navegador. Esto permite comprobar el estado DOM, pero no acredita desplazamiento real, foco nativo completo, diseño CSS ni reproducción multimedia.

## Cuándo ejecutar cada comprobación

Durante una edición se seleccionan los archivos afectados. Una regresión completa se ejecuta al integrar cambios compartidos o cerrar una entrega; la cobertura se genera cuando se actualiza la evidencia. Este cierre no repite toda la suite por el ajuste exclusivo de CSS: usa compilación y revisión visual para ese cambio.

## Cinco casos de presentación y reglas

Los nombres siguientes corresponden a pruebas aprobadas en el corte. La guía de defensa incluye sus comandos individuales y sirve para explicar el comportamiento observado y el error que cada caso detecta.

### 1 Props de producto

Archivo: `src/components/molecules/ProductCard.test.jsx`.

Caso: «renderiza los datos principales recibidos mediante la prop product».

Se entrega un producto por props y se comprueban nombre, categoría y precio en el DOM. Detecta pérdida o presentación incorrecta de datos. No necesita un mock.

### 2 Callback de agregar

Archivo: `src/components/molecules/ProductCard.test.jsx`.

Caso: «entrega el producto al callback cuando se presiona Agregar».

userEvent pulsa Agregar y un vi.fn comprueba que recibe el objeto product. Detecta un evento desconectado o un argumento incorrecto; la persistencia se verifica en otros casos del carrito.

### 3 Producto agotado

Archivo: `src/components/atoms/StockBadge.test.jsx`.

Caso: «muestra Sin stock cuando no quedan unidades».

Se renderiza stock 0 con nivel crítico 5 y se espera Sin stock. Comprueba la precedencia del agotamiento frente al estado crítico.

### 4 Controles bloqueados

Archivo: `src/components/molecules/QuantitySelector.test.jsx`.

Caso: «permite bloquear ambos límites sin ejecutar los callbacks».

Con ambos límites deshabilitados se intenta aumentar y disminuir. Dos mocks verifican que ningún callback se ejecuta. La regla numérica de stock se prueba además en cart.test.js.

### 5 Despacho gratuito

Archivo: `src/utils/cart.test.js`.

Caso: «calcula despacho gratuito desde $50.000».

Dos unidades de $39.990 producen despacho $0 y total $79.980. Es una prueba de función pura; este caso comprueba un subtotal sobre el umbral, no una medición de rendimiento ni el valor límite exacto.

## Cinco casos de interacción y recuperación

Los nombres siguientes corresponden a pruebas aprobadas en el corte. La guía de defensa incluye sus comandos individuales y sirve para explicar el comportamiento observado y el error que cada caso detecta.

### 6 Búsqueda del catálogo

Archivo: `src/pages/ProductsPage.test.jsx`.

Caso: «filtra el catálogo al escribir en el buscador».

Se escribe en el buscador y se comprueba la presencia del producto coincidente y la ausencia de otros productos. Detecta filtros que no actualizan el DOM.

### 7 Estado del menú móvil

Archivo: `src/components/organisms/Navbar.test.jsx`.

Caso: «abre y cierra el menú móvil y lo cierra al navegar».

Los clics alternan aria-expanded y la clase show; al ir a Tienda el menú se cierra y el enlace queda activo. jsdom verifica estado y atributos; la apariencia se revisa en navegador.

### 8 Región y comuna

Archivo: `src/components/organisms/RegistrationForm.test.jsx`.

Caso: «habilita comunas de la región y reinicia la selección al cambiarla».

La comuna inicia deshabilitada. Tras elegir Santiago y cambiar a Valparaíso se vacía el valor, desaparece Santiago y aparece Viña del Mar. Evita conservar una comuna incompatible.

### 9 Guarda de acceso

Archivo: `src/routes/ProtectedRoute.test.jsx`.

Caso: «no monta contenido privado para un visitante y conserva ruta y filtros para Login».

Sin sesión se muestra Login, se preservan pathname y search y no aparece el contenido privado. Un mock de montaje confirma que el componente protegido no se montó.

### 10 Recuperación de almacenamiento

Archivo: `src/services/adminUsers.test.js`.

Caso: «revierte la sesión si falla guardar el perfil propio».

Un spy de Storage.prototype.setItem lanza una DOMException al escribir usuarios. Se espera código STORAGE, usuarios originales y sesión anterior. Detecta un perfil o una sesión parcialmente actualizados.

## Revisión en navegador y riesgos residuales

Se revisaron 22 rutas y variantes que cubren las 20 pantallas originales, en 390 × 844, 768 × 1024 y 1280 × 800. Las 66 mediciones registraron un main y un h1, sin desbordamiento horizontal de la página ni imágenes cargadas con error. Las tablas conservan su desplazamiento interno. La evidencia corresponde al navegador integrado basado en Chromium y a los estados recorridos.

Además se comprobaron acceso directo, cinco rutas inexistentes, menú móvil, registro y errores de formularios, contacto local, carrito persistente, rutina editable y cambio de roles. El carrito conservó tres unidades de creatina con despacho gratuito; la rutina conservó un ejercicio y cinco series después de recargar y cerrar sesión.

La administración permitió crear, editar y eliminar un producto de prueba, con cancelación previa de la eliminación. Vendedor accedió a consultas y no a formularios restringidos; Cliente volvió a la tienda; una visita anónima fue dirigida a Login. No se registraron errores ni advertencias en la consola de la aplicación durante los recorridos revisados.

## Corrección visual

La etiqueta de stock se dividía en varias líneas dentro de la tabla móvil de productos. El commit 55f03c3 aplica white-space: nowrap a esa etiqueta, conservando el diseño de KYNEX y el desplazamiento de la tabla. Se verificó el resultado sobre el build de producción.

## Código que no se ejecutó en esta medición

| Zona | Cobertura relevante | Lectura del riesgo |
| --- | --- | --- |
| Utilidades del carrito | 68,18% de ramas | Quedan combinaciones alternativas de entradas y normalización. |
| CartContext | 84,61% de ramas | Se prueban datos dañados y límites; no todas las variantes de decisiones. |
| RoutineBuilder | 78,94% de ramas | Persistencia probada; quedan variantes de recuperación en la interfaz. |
| AdminLayout y useCart | 76,92% y 75% de líneas | Callbacks y uso fuera del proveedor no están totalmente ejecutados. |

No se añadieron pruebas que solo repitan la implementación para elevar porcentajes. Ante cambios en estas zonas conviene seleccionar escenarios de comportamiento que reproduzcan un riesgo real, incluidos límites exactos y recuperación de fallos.

## Límites de la evidencia y reproducción

## Alcance y exclusiones

V8 instrumenta src/**/*.{js,jsx}; se excluyen main.jsx, src/test y los archivos de pruebas. CSS, HTML/JS heredado, rendimiento real, servicios de terceros y requisitos no implementados no quedan acreditados por estos porcentajes. Los 597 casos incluyen pruebas unitarias y de integración; no se presentan como 597 pruebas unitarias aisladas.

El iframe y el enlace directo conservan el video original. YouTube mostró que el video está restringido y requiere aprobación, con código 151, tanto dentro del iframe como en su página. La reproducción no pudo validarse en este entorno y debe comprobarse en el navegador de presentación. Esta observación no demuestra un fallo del componente React.

RNF-01 y RNF-02 conservan objetivos de 3 segundos y 300 milisegundos, sin una medición específica que los acredite. RNF-12 requiere comprobar Chrome, Edge, Firefox y Safari; el navegador integrado no sustituye esa matriz. Los casos de etiquetas, teclado y foco tampoco constituyen una auditoría exhaustiva de accesibilidad.

El sistema mantiene el alcance académico: sesión y datos en LocalStorage, contacto con validación local, pedidos demostrativos y aviso de checkout sin pago ni creación de pedidos. Las guardas del cliente no reemplazan autorización en servidor para una futura versión productiva.

## Reproducir desde GitHub

```powershell
git clone --branch feature/react-migration --single-branch https://github.com/AlexanderLlanten/Fs2_pROYECTO.git
cd Fs2_pROYECTO
npm.cmd ci
npm.cmd run test:coverage
npm.cmd run build
npm.cmd run preview
```

Desde el ZIP, extraer el proyecto, abrir una terminal en la carpeta que contiene package.json y ejecutar los cuatro últimos comandos. Node 24.22.1 fue la versión comprobada. Usar la URL que imprima Vite y mantener el mismo host y puerto para conservar los datos locales de esa sesión de prueba.

## Fuentes y entregables relacionados

Pauta DSY1104 Evaluación Parcial 2 EE EP Estudiante, páginas 3–4 y 6–9; ERS KYNEX 2.1; vite.config.js; package-lock.json; archivos citados en los casos. Los resultados y nombres de los 597 casos están en docs/evidencias/testing-final.json y el detalle de cobertura en docs/evidencias/coverage-summary.json. El HTML se regenera en coverage/index.html.

docs/auditoria-final.md conserva los recorridos y sus límites; docs/guia-defensa.md prepara la exposición de diez casos. Repositorio público: https://github.com/AlexanderLlanten/Fs2_pROYECTO/tree/feature/react-migration. La evaluación de la exposición individual corresponde al docente.
