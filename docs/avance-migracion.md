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

En este corte se cerraron los pendientes identificados de Inicio y el aviso
demostrativo de Continuar compra. Se recuperaron objetivos, entrenamiento/rutina,
artículos, video y accesos a tienda, Nosotros y registro, conservando los componentes
y funcionalidades actuales. El carrito informa el alcance demostrativo sin generar
pedidos ni modificar la compra. La etapa anterior había completado catálogo y detalle.
La evidencia acumulada y la limitación de reproducción del video externo se registran
en [paridad-ep1.md](paridad-ep1.md).
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
| IE2.1.1: aplicación con framework JS | 10% | 60% | 6,0 | Las 20 pantallas tienen ruta React. Catálogo, detalle e Inicio contrastados; aviso de Continuar compra recuperado. Quedan revisión transversal, validación del video externo y cierre del ERS con trazabilidad. |
| IE2.1.2: componentes, props, estado y Bootstrap responsivo | 10% | 80% | 8,0 | Layouts, carrito, autenticación, formularios y contenido reutilizables, con revisión visual por etapa. Falta la revisión transversal final de componentes, navegación y responsividad en todo el alcance. |
| IE2.2.1: pruebas de lógica y comportamiento | 12% | 100% | 12,0 | 597 pruebas correctas, con componentes, DOM, eventos, permisos, CRUD, servicios y recorridos integrados; superan las 10 pruebas del descriptor máximo. La auditoría final puede requerir casos adicionales según los hallazgos. |
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
| Inicio | 1 | Bloques y accesos contrastados; video original y enlace alternativo, reproducción externa no confirmada |
| Catálogo, detalle, carrito | 3 | Migrados; catálogo y ficha contrastados, aviso demostrativo de Continuar compra recuperado |
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

- Pruebas seleccionadas mediante `npm test -- HomePage FeatureSection HomeParity CartSummary CartPage`:
  **5 archivos, 30 pruebas aprobadas**, unos 14 segundos en este equipo.
- Regresión completa de cierre mediante `npm run test:coverage`: **80 archivos,
  597 pruebas aprobadas, 0 fallidas**, unos 206 segundos en este equipo.
- `npm run build`: compilación de producción correcta.
- Navegador sobre `vite preview`: las siete imágenes de Inicio cargadas desde las URL
  del build, enlaces a Entrenamiento, Rutina y artículo de recuperación, con compra
  y rutina conservadas. El aviso de Continuar compra mantiene cuatro unidades y
  total $76.970; no navega ni genera un pedido.
- Inicio en escritorio de 1280 × 800, tableta de 768 × 1024 y móvil de 390 × 844 sin
  desbordamiento horizontal. Aviso del carrito revisado en escritorio y móvil. Se
  ajustó el gutter del hero. Sin errores ni advertencias en la consola de la aplicación.
- El iframe de YouTube mostró código 151 en el navegador de revisión. Se conserva el
  video original con enlace directo, pero su reproducción queda pendiente de validar
  en el navegador de entrega. Las pruebas DOM no validan un reproductor externo.
- Regresión automatizada de tienda, registro, carrito y permisos, además del ciclo
  de usuarios, eliminación confirmada, duplicados, reducción del propio rol, cambio
  de correo de la cuenta conectada, conflictos entre pestañas y errores de almacenamiento.
- 23 pruebas adicionales: dos de composición de Inicio, una de acciones opcionales en
  FeatureSection, dos del aviso de CartSummary y 18 recorridos de HomeParity. Cubren
  cuatro perfiles (incluida visita anónima), recarga, siete destinos, cuatro objetivos,
  catálogo vacío o dañado, video original y aviso sin solicitudes ni escrituras.
  Se comprueban teclado, foco y descripción accesible del botón.

### Auditoría de paridad

[paridad-ep1.md](paridad-ep1.md) identifica las 20 pantallas y sus rutas, las fuentes
originales y las correcciones de catálogo/detalle, Inicio y Continuar compra. Para los
demás módulos registra la migración y sus pruebas previas;
no afirma una revisión manual exhaustiva de cada elemento visual en este corte.
Los campos heredados explícitos prevalecen sobre las sugerencias del catálogo inicial;
los productos ajenos a los seis originales no reciben una ficha nutricional por código.

### Alcance de Blog y artículos

Las rutas son `/blog`, `/blog/creatina-y-rendimiento` y `/blog/recuperacion-muscular`.
El cuerpo de lectura representa datos estructurados con JSX y texto, sin inyectar HTML.
Se mantienen las notas educativas y académicas de la versión original; no se agregan
servicios, claves de almacenamiento ni funcionalidades editoriales administrativas.
«Volver al blog» funciona sin depender del historial anterior. Un slug desconocido
muestra «Artículo no encontrado» y un enlace de regreso; otros subcaminos muestran 404.

### Alcance de Nosotros

Se conservaron las secciones e iconos del HTML original. Las descripciones de la ficha
de producto resumen datos que muestra React; el detalle ya incorpora también ingredientes,
uso y nutrición. Las categorías
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
etapa se ejecutó además la regresión completa porque cambiaron
FeatureCard/FeatureSection compartidos con Nosotros, la composición de Inicio y el
resumen del carrito. El estudiante puede usar la selección de 30 pruebas
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
| Sentencias | 1314 / 1342 | 97,91% |
| Ramas | 1047 / 1106 | 94,66% |
| Funciones | 431 / 434 | 99,30% |
| Líneas | 1077 / 1088 | 98,98% |

La configuración incluye `src/**/*.{js,jsx}`, excluyendo `src/main.jsx` y los
auxiliares de `src/test`. Vitest excluye los archivos de pruebas de la instrumentación.
El resultado no mide HTML/JavaScript heredado, CSS, comportamiento visual ni requisitos
que no se hayan traducido a código. **98,98% de líneas no significa 98,98% de migración.**

Quedan ramas alternativas de utilidades de carrito (68,18%) y de presentación, además
de algunas recuperaciones de errores de páginas. CartContext alcanza 84,61% de ramas;
ya se verifican referencias inexistentes, datos dañados y límites frente al catálogo.
Los permisos, guardas, usuarios, productos y pedidos tienen pruebas de servicio y
recorrido. Contacto añade validación e integración pública; Entrenamiento y rutina
añaden reglas, persistencia y edición. RoutineBuilder alcanza 78,94% de ramas: quedan
algunas variantes de error/recuperación de la página, aunque el servicio sí comprueba
los fallos de lectura, guardado y vaciado. Nosotros y FeatureSection agregan cobertura
de composición y navegación pública. Blog agrega casos de portada, artículos e imágenes.
La ficha completa incorpora casos de datos originales, compatibilidad, información
ausente y cantidad real agregada según stock. Inicio agrega los bloques originales,
las acciones opcionales de las tarjetas y el comportamiento del aviso de compra.
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

1. Revisar navegación directa, rutas inexistentes, persistencia y responsividad en
   el alcance completo; comprobar el video externo en el navegador de entrega y
   ejecutar regresión y cobertura final con casos relevantes.
2. Actualizar el ERS con requisitos, alcance final y trazabilidad. Cerrar el documento
   de cobertura de testing con casos, resultados, mocks, exclusiones y análisis.
3. Preparar el comprimido del proyecto y verificar los entregables y el enlace GitHub.
4. Preparar y ensayar la defensa individual, mostrando las 10 pruebas seleccionadas.

La siguiente etapa realiza la revisión transversal y comienza el cierre documental.
El tiempo pendiente depende del alcance de los módulos restantes; estos porcentajes
no permiten deducir un número de horas o días con fiabilidad.
