# Avance de la migración KYNEX

Fecha de corte: 26 de octubre de 2026. Rama: `feature/react-migration`.

## Dos medidas distintas

- **Autoevaluación técnica frente a la pauta: 81%; pendiente estimado: 19%.**
  Se calcula sobre los cuatro indicadores del encargo, cuyo peso conjunto es 40%
  de la evaluación. Es una estimación de cumplimiento, no una calificación del docente
  ni un porcentaje de horas de trabajo realizadas.
- **Migración de pantallas: 20 de 20, equivalente a 100%; quedan 0 pantallas del inventario sin ruta React.**
  Cuenta cada pantalla HTML original una vez, incluido el inicio. No pondera el
  esfuerzo ni el trabajo de cierre. **100% de pantallas no equivale a 100% del proyecto:**
  siguen pendientes la revisión final de paridad y recursos, documentación, entregables
  y defensa individual.

La pauta evalúa también requisitos, proceso y evidencia de testing, además del código.
El inventario permite comprobar que ya hay una ruta React para cada pantalla original;
la autoevaluación ponderada incluye pendientes que ese conteo no mide.

En este corte se completaron Blog y los dos artículos originales, con imágenes,
categorías, resúmenes, secciones, listas y notas informativas. Comparten portada,
tarjetas y cuerpo de lectura, con acceso directo, recarga y regreso al Blog. Se
integraron cabecera, pie y retorno desde Login; se conservan carrito y rutina.
Se verificaron escritorio, tableta y móvil, y se ajustó el espaciado del menú para
alojar todos los accesos sin partir sus etiquetas en escritorio.
La estimación técnica se mantiene de forma conservadora en 81% hasta cerrar la
auditoría de paridad, requisitos y documentación. Contar las 20 pantallas no basta
para elevar automáticamente los niveles de la rúbrica.

## Fuente y método

Se revisó el documento local **DSY1104 Evaluación Parcial 2_EE_EP_Estudiante.pdf**,
en especial instrucciones y entregables (páginas 2-4) e indicadores (páginas 6-9).
La EP2 pesa 30% de la asignatura. Dentro de ella, el encargo pesa 40% y la presentación
individual 60%. Estos porcentajes no se deben confundir.

La pauta menciona Jasmine y Karma. El estudiante confirmó en esta conversación que
el docente autorizó Vitest como alternativa. Esta autoevaluación usa esa autorización;
conviene conservar su respaldo para la entrega.

Se escogió un nivel de logro de la propia rúbrica para cada indicador técnico y se
multiplicó por su ponderación. Las asignaciones siguientes son juicio de revisión
del estado actual del repositorio y deben revisarse al terminar la migración.

| Indicador | Peso en EP2 | Nivel estimado | Aporte estimado | Evidencia y pendiente |
| --- | ---: | ---: | ---: | --- |
| IE2.1.1: aplicación con framework JS | 10% | 60% | 6,0 | Las 20 pantallas tienen ruta y contenido React/Vite/Router, con Atomic Design. Se conserva este nivel hasta verificar paridad funcional y recursos frente a la EP1 y cerrar el ERS con trazabilidad. |
| IE2.1.2: componentes, props, estado y Bootstrap responsivo | 10% | 80% | 8,0 | Layouts, carrito, autenticación, formularios y contenido reutilizables, con revisión visual por etapa. Falta la revisión transversal final de componentes, navegación y responsividad en todo el alcance. |
| IE2.2.1: pruebas de lógica y comportamiento | 12% | 100% | 12,0 | 550 pruebas correctas, con componentes, DOM, eventos, permisos, CRUD, servicios y recorridos integrados; superan las 10 pruebas del descriptor máximo. La auditoría final puede requerir casos adicionales según los hallazgos. |
| IE2.3.1: proceso de testing, mocks, resultados y cobertura | 8% | 80% | 6,4 | Entorno jsdom, RTL, mocks de callbacks/Storage/Date y cobertura V8 medida. Falta cerrar el documento de testing, analizar los riesgos residuales y repetir la medición sobre el alcance final. |
| **Encargo** | **40%** | | **32,4 / 40** | **32,4 ÷ 40 × 100 = 81%. Pendiente ponderado: 7,6 / 40 = 19%.** |

El 100% estimado en pruebas describe la evidencia actual frente al indicador; no
declara terminado el testing ni sustituye la comprobación final contra requisitos.
Los documentos y el comprimido final siguen pendientes aunque haya código funcional.

## Presentación individual: seguimiento separado

| Indicador | Peso en EP2 | Preparación que falta verificar |
| --- | ---: | --- |
| IE2.1.3 | 15% | Explicar arquitectura, framework, navegación y decisiones de implementación. |
| IE2.1.4 | 20% | Demostrar props, estado y diseño Bootstrap en distintos tamaños. |
| IE2.2.2 | 15% | Seleccionar y explicar 10 pruebas representativas, su ejecución y los errores que detectan. |
| IE2.3.2 | 10% | Explicar entorno, mocks, resultados y límites de la cobertura. |

No se asigna un porcentaje de logro a una presentación que todavía no se ha observado.
El 81% técnico no equivale a tener el 81% de la evaluación completa ni asegura una nota.
Hay código para preparar estas demostraciones; todavía faltan el guion y el ensayo.

## Inventario funcional

| Bloque | Pantallas originales | Estado React |
| --- | ---: | --- |
| Inicio | 1 | Migrado |
| Catálogo, detalle, carrito | 3 | Migrados; pendiente revisión final de paridad y recursos del catálogo |
| Login y registro | 2 | Migrados |
| Contacto | 1 | Migrado, con validación local como en la EP1 |
| Nosotros | 1 | Migrada, con secciones reutilizables y accesos a la tienda |
| Blog y dos artículos | 3 | Migrados, con contenido e imágenes originales y lectura compartida |
| Entrenamiento y rutina | 2 | Migradas, con biblioteca, ajustes y persistencia compatible |
| Gestión de usuarios: lista y formulario | 2 | Migradas, con permisos y persistencia compartida |
| Administración: panel, productos, formulario de producto, pedidos y detalle de pedido | 5 | Migradas; pedidos conserva el alcance demostrativo de consulta de la EP1 |
| **Total** | **20** | **20 migradas / 0 pendientes de incorporar a React; cierre de paridad pendiente** |

La matriz de permisos y las guardas ya existen. `/admin` y sus rutas desconocidas
exigen ADMIN_ACCESS: Administrador y Vendedor entran; Cliente vuelve a la tienda;
sin sesión se solicita Login. El menú público muestra Administración solo a perfiles
autorizados. La sesión se reevalúa ante cambios de rol, eliminación de usuario y
cierre desde otra pestaña.

USERS_MANAGE y PRODUCTS_MANAGE se reservan al Administrador; PRODUCTS_VIEW y
ORDERS_VIEW permiten también Vendedor. Estas reglas se verifican en la matriz y
con guardas anidadas en pruebas. USERS_MANAGE ya protege las rutas y las operaciones
de usuarios; el menú oculta este módulo a Vendedor. Productos conecta PRODUCTS_VIEW
en la lista y PRODUCTS_MANAGE en formularios y operaciones. El resumen del panel y
la tienda comparten el catálogo persistido. ORDERS_VIEW protege la lista y el detalle,
además de comprobarse al consultar los datos desde el servicio.

## Verificación realizada en esta etapa

- Pruebas seleccionadas mediante `npm test -- ArticleImage BlogCard ArticleContent BlogPage Blog.test`:
  **5 archivos, 23 pruebas aprobadas**, unos 11 segundos en este equipo.
- Regresión completa de cierre mediante `npm run test:coverage`: **76 archivos,
  550 pruebas aprobadas, 0 fallidas**, unos 180 segundos en este equipo.
- `npm run build`: compilación de producción correcta.
- Navegador: portada con los dos artículos y fotografías originales cargadas,
  apertura y lectura completa de creatina, retorno al Blog, apertura y recarga
  de recuperación muscular, navegación de cabecera y cierre del menú móvil.
- Vistas de escritorio de 1280 × 800 y 1200 × 800, tableta de 768 × 1024 y móvil
  de 390 × 844: imágenes, tarjetas y texto dentro del ancho disponible. El espaciado
  de cabecera conserva sus etiquetas en una línea en escritorio; la ficha del usuario
  limita su ancho y conserva el nombre completo en el título del control. Sin
  desbordamiento horizontal, errores ni advertencias de consola en la revisión.
- Regresión automatizada de tienda, registro, carrito y permisos, además del ciclo
  de usuarios, eliminación confirmada, duplicados, reducción del propio rol, cambio
  de correo de la cuenta conectada, conflictos entre pestañas y errores de almacenamiento.
- 32 pruebas adicionales: 23 en los cinco archivos nuevos y nueve casos de rutas,
  enlace activo y retorno de Login en pruebas compartidas. Cubren composición por
  props, imágenes ausentes/fallidas y recuperación, tarjetas con enlaces distinguibles,
  contenido original, ambos artículos, todos los perfiles, menú móvil, recarga,
  retorno desde Login y conservación de datos. También verifican artículos desconocidos,
  subcaminos sin implementar y un solo layout. La regresión previa sigue comprobando
  el resto de módulos y la nueva cabecera común.

### Alcance de Blog y artículos

Las rutas son `/blog`, `/blog/creatina-y-rendimiento` y `/blog/recuperacion-muscular`.
El cuerpo de lectura representa datos estructurados con JSX y texto, sin inyectar HTML.
Se mantienen las notas educativas y académicas de la versión original; no se agregan
servicios, claves de almacenamiento ni funcionalidades editoriales administrativas.
«Volver al blog» funciona sin depender del historial anterior. Un slug desconocido
muestra «Artículo no encontrado» y un enlace de regreso; otros subcaminos muestran 404.

### Alcance de Nosotros

Se conservaron las secciones e iconos del HTML original. Las descripciones de la ficha
de producto se ajustaron a los datos que muestra React, sin anunciar ingredientes ni
información nutricional que aún no están disponibles en ese detalle. Las categorías
reutilizan CategoryGrid y sus enlaces con `categoria` en la URL. La página no agrega
servicios ni claves de almacenamiento. El contenido sobre Blog se conserva como parte
de la propuesta original; su portada y dos artículos también están disponibles en React.

### Compatibilidad y límites de la rutina

La rutina sigue perteneciendo al navegador y conserva el formato `{ id, sets, reps }`.
Leer no escribe: convierte cantidades numéricas de texto, aplica sugerencias cuando
faltan valores y omite ejercicios inexistentes como la EP1. Los excesos heredados se
ajustan al rango declarado por la interfaz original: 1–20 series y 1–100 repeticiones.
Los nuevos valores fuera de rango muestran un error y no se guardan. JSON dañado,
registros mal formados o ids repetidos bloquean las escrituras sin borrar los datos.
La lectura más reciente precede a cada operación; LocalStorage no ofrece transacciones
atómicas entre pestañas. Cambiar o cerrar sesión conserva esta rutina compartida en
el navegador, igual que la versión original.

### Frecuencia de pruebas

Durante el desarrollo se ejecutan las pruebas del módulo afectado. Al cerrar esta
etapa se ejecutó además la regresión completa porque cambiaron Navbar, Footer,
rutas y retorno desde Login, además del ajuste de la cabecera compartida.
El estudiante puede usar la selección de 23 pruebas
como comprobación rápida tras sincronizar este mismo código. No necesita repetir
la cobertura en cada paso. La suite completa vuelve a ejecutarse cuando cambian
dependencias compartidas, aparecen fallos o se prepara la entrega final; la cobertura
actualiza la evidencia del corte. Esta estrategia está descrita también en README.

### Antecedente: corrección de la ejecución intermitente de pruebas

La salida aportada por el estudiante mostró siete pruebas que agotaron el límite
de 5 segundos y tres fallos posteriores en los mismos archivos de formularios y
recorridos integrados. La suite anterior pasó localmente, por lo que no se pudo
reproducir el fallo en todas las ejecuciones. El patrón es compatible con actividad
asíncrona pendiente tras agotar el tiempo de una prueba.

Se limita Vitest a dos procesos para evitar crear demasiados entornos jsdom a la
vez. El auxiliar de registro completa los campos mediante pegado simulado con
userEvent; conserva los eventos de entrada, cambio y salida de foco. Los casos
específicos de escritura y corrección siguen usando teclado. Se mantienen todas
las aserciones, el aislamiento entre archivos y el límite original de 5 segundos.
Esta corrección afecta solo al entorno de pruebas, sin alterar las pantallas ni
el porcentaje de migración.

En el commit `b498f35`, los cuatro archivos afectados pasaron sus 46 pruebas; la más
lenta terminó en 1,62 segundos. Tanto `npm test` como `npm run test:coverage` aprobaron
las 303 pruebas de ese corte. El estudiante confirmó después los mismos resultados.
`npm test` tardó unos 83 segundos localmente y unos 60 en la ejecución del estudiante.
Limitar procesos puede aumentar la duración total de la suite a cambio de reducir
la carga simultánea.

### Cobertura medida

| Métrica | Cubierto / total | Porcentaje |
| --- | ---: | ---: |
| Sentencias | 1258 / 1285 | 97,89% |
| Ramas | 972 / 1033 | 94,09% |
| Funciones | 404 / 407 | 99,26% |
| Líneas | 1030 / 1041 | 98,94% |

La configuración incluye `src/**/*.{js,jsx}`, excluyendo `src/main.jsx` y los
auxiliares de `src/test`. Vitest excluye los archivos de pruebas de la instrumentación.
El resultado no mide HTML/JavaScript heredado, CSS, comportamiento visual ni requisitos
que no se hayan traducido a código. **98,94% de líneas no significa 98,94% de migración.**

Quedan ramas alternativas de utilidades de carrito (68,18%) y de presentación, además
de algunas recuperaciones de errores de páginas. CartContext alcanza 84,61% de ramas;
ya se verifican referencias inexistentes, datos dañados y límites frente al catálogo.
Los permisos, guardas, usuarios, productos y pedidos tienen pruebas de servicio y
recorrido. Contacto añade validación e integración pública; Entrenamiento y rutina
añaden reglas, persistencia y edición. RoutineBuilder alcanza 78,94% de ramas: quedan
algunas variantes de error/recuperación de la página, aunque el servicio sí comprueba
los fallos de lectura, guardado y vaciado. Nosotros y FeatureSection agregan cobertura
de composición y navegación pública. Blog agrega casos de portada, artículos e imágenes.
La auditoría contra la versión original y el ERS deberá identificar posibles huecos de
requisitos; la cobertura alta solo describe el código instrumentado en este corte.
Los callbacks del menú y algunas ramas de recuperación de errores no se ejecutan en
esta medición; el menú móvil se revisó también en navegador. LocalStorage no proporciona
una transacción entre pestañas: se detectan conflictos contra el perfil abierto,
pero un servidor será necesario para coordinación concurrente.

Los informes HTML y JSON se regeneran en `coverage/` con `npm run test:coverage`;
se mantienen fuera del historial Git. Este documento conserva la medición de corte.

### Diez ejemplos disponibles para preparar la defensa

| Caso | Evidencia en el repositorio |
| --- | --- |
| Datos recibidos mediante props en una tarjeta | `src/components/molecules/ProductCard.test.jsx` |
| No montar contenido privado sin sesión o permiso | `src/routes/ProtectedRoute.test.jsx` |
| Límite de cantidad por stock | `src/utils/cart.test.js` |
| Regla de despacho gratuito | `src/utils/cart.test.js` |
| Filtrado de catálogo por búsqueda | `src/pages/ProductsPage.test.jsx` |
| Estado del menú móvil y navegación | `src/components/organisms/Navbar.test.jsx` |
| Sesión y rol sincronizados entre pestañas | `src/context/AuthContext.test.jsx` |
| Fallo al editar el perfil propio y reversión de sesión | `src/services/adminUsers.test.js` |
| Región y comuna dependientes | `src/components/organisms/RegistrationForm.test.jsx` |
| Creación, edición y eliminación/cancelación de usuarios | `src/AdminUsers.test.jsx` |

## Trabajo restante y orden propuesto

1. Auditar paridad con la versión original, completar recursos del catálogo y enlaces
   pendientes y corregir los hallazgos con pruebas relevantes.
2. Revisar navegación directa, rutas inexistentes, persistencia y responsividad en
   el alcance completo; ejecutar regresión y cobertura final con casos relevantes.
3. Actualizar el ERS con requisitos, alcance final y trazabilidad. Cerrar el documento
   de cobertura de testing con casos, resultados, mocks, exclusiones y análisis.
4. Preparar el comprimido del proyecto y verificar los entregables y el enlace GitHub.
5. Preparar y ensayar la defensa individual, mostrando las 10 pruebas seleccionadas.

La siguiente etapa es la auditoría de paridad y recursos del catálogo antes del cierre documental.
El tiempo pendiente depende del alcance de los módulos restantes; estos porcentajes
no permiten deducir un número de horas o días con fiabilidad.
