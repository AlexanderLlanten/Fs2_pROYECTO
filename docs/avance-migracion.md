# Avance de la migración KYNEX

Fecha de corte: 26 de octubre de 2026. Rama: `feature/react-migration`.

## Dos medidas distintas

- **Autoevaluación técnica frente a la pauta: 81%; pendiente estimado: 19%.**
  Se calcula sobre los cuatro indicadores del encargo, cuyo peso conjunto es 40%
  de la evaluación. Es una estimación de cumplimiento, no una calificación del docente
  ni un porcentaje de horas de trabajo realizadas.
- **Migración de pantallas: 14 de 20, equivalente a 70%; faltan 6, equivalente a 30%.**
  Cuenta cada pantalla HTML original una vez, incluido el inicio. No pondera el
  esfuerzo: la base compartida, carrito, autenticación, formularios y pruebas ya
  implementadas se reutilizarán en las pantallas siguientes. Tampoco implica paridad
  completa de todo el contenido y los recursos visuales de cada pantalla.

La diferencia se debe al peso que la pauta da a componentes y testing. Cumplir esos
indicadores puede avanzar antes de terminar todas las pantallas. Para planificar el
trabajo pendiente de migración hay que considerar ambas medidas.

En este corte se completó Contacto, con validaciones de nombre, correo y comentario,
contador, errores accesibles y confirmación local. Usa el layout público y tiene
accesos desde la cabecera y el pie. Se conserva el alcance de validación de la EP1;
se aclara en la página que la demostración valida el mensaje sin enviarlo.
El 81% técnico se mantiene porque los niveles ponderados de los indicadores todavía
no cambian; el avance funcional sí pasa de 65% a 70%.

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
| IE2.1.1: aplicación con framework JS | 10% | 60% | 6,0 | React/Vite/Router, Atomic Design, panel, usuarios, catálogo editable, pedidos y Contacto integrados. Quedan seis páginas públicas, paridad final y cierre del ERS. |
| IE2.1.2: componentes, props, estado y Bootstrap responsivo | 10% | 80% | 8,0 | Layouts público y administrativo, carrito, autenticación y formularios reutilizables; revisión visual de escritorio y móvil. Falta aplicar y revisar esta estructura en todos los módulos restantes. |
| IE2.2.1: pruebas de lógica y comportamiento | 12% | 100% | 12,0 | 448 pruebas correctas, con componentes, DOM, eventos, permisos, CRUD, servicios y recorridos integrados; superan las 10 pruebas del descriptor máximo. Se deberán agregar casos para cada módulo nuevo. |
| IE2.3.1: proceso de testing, mocks, resultados y cobertura | 8% | 80% | 6,4 | Entorno jsdom, RTL, mocks de callbacks/Storage/Date y cobertura V8 medida. Falta cerrar el documento de testing, analizar los riesgos residuales y repetir la medición sobre el alcance final. |
| **Encargo** | **40%** | | **32,4 / 40** | **32,4 ÷ 40 × 100 = 81%. Pendiente ponderado: 7,6 / 40 = 19%.** |

El 100% estimado en pruebas describe la evidencia actual frente al indicador; no
declara terminado el testing de funcionalidades que aún no existen en React.
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
| Nosotros, blog y dos artículos | 4 | Pendientes |
| Entrenamiento y rutina | 2 | Pendientes |
| Gestión de usuarios: lista y formulario | 2 | Migradas, con permisos y persistencia compartida |
| Administración: panel, productos, formulario de producto, pedidos y detalle de pedido | 5 | Migradas; pedidos conserva el alcance demostrativo de consulta de la EP1 |
| **Total** | **20** | **14 migradas / 6 pendientes** |

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

- Pruebas específicas mediante `npm test -- ContactForm contact.test Contact.test`:
  **3 archivos, 20 pruebas aprobadas**, unos 9 segundos en este equipo.
- Regresión completa de cierre mediante `npm run test:coverage`: **62 archivos,
  448 pruebas aprobadas, 0 fallidas**, unos 124 segundos en este equipo.
- `npm run build`: compilación de producción correcta.
- Navegador: Contacto directo con sesión activa, validación vacía y foco en Nombre,
  rechazo de correo no permitido, corrección y confirmación con valores conservados;
  menú móvil y recarga de la ruta. Se usaron datos ficticios de prueba.
- Vista de escritorio de 1280 × 800 y móvil de 390 × 844: campos dentro del ancho
  disponible y sin desbordamiento horizontal. No hay errores ni advertencias de consola.
- Regresión automatizada de tienda, registro, carrito y permisos, además del ciclo
  de usuarios, eliminación confirmada, duplicados, reducción del propio rol, cambio
  de correo de la cuenta conectada, conflictos entre pestañas y errores de almacenamiento.
- 23 pruebas adicionales: 20 específicas de Contacto y tres casos de ruta pública,
  enlace activo y retorno de Login en pruebas compartidas. Cubren campos vacíos,
  límites de 100/500 caracteres, correos permitidos, contador, foco, corrección,
  confirmación, todos los perfiles, navegación, ausencia de petición de envío,
  conservación de datos guardados y del borrador al cerrar sesión en la misma ruta.

### Frecuencia de pruebas

Durante el desarrollo se ejecutan las pruebas del módulo afectado. Al cerrar esta
etapa se ejecutó además la regresión completa porque cambiaron Navbar, Footer,
rutas y retorno desde Login. El estudiante puede usar la selección de 20 pruebas
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
| Sentencias | 1075 / 1101 | 97,63% |
| Ramas | 843 / 901 | 93,56% |
| Funciones | 327 / 330 | 99,09% |
| Líneas | 889 / 900 | 98,77% |

La configuración incluye `src/**/*.{js,jsx}`, excluyendo `src/main.jsx` y los
auxiliares de `src/test`. Vitest excluye los archivos de pruebas de la instrumentación.
El resultado no mide HTML/JavaScript heredado, CSS, comportamiento visual ni módulos
que todavía no se implementan. **98,77% de líneas no significa 98,77% de migración.**

Quedan ramas alternativas de utilidades de carrito (68,18%) y de presentación, además
de algunas recuperaciones de errores de páginas. CartContext alcanza 84,61% de ramas;
ya se verifican referencias inexistentes, datos dañados y límites frente al catálogo.
Los permisos, guardas, usuarios, productos y pedidos tienen pruebas de servicio y
recorrido. Contacto añade validación e integración pública. Faltan los casos de las
seis páginas que todavía no se implementan.
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

1. Migrar entrenamiento y rutina con sus validaciones y comportamiento.
2. Migrar nosotros, blog y artículos. Completar enlaces,
   recursos del catálogo y paridad funcional con el proyecto original.
3. Revisar navegación directa, rutas inexistentes, persistencia y responsividad en
   el alcance completo; ejecutar regresión y cobertura final con casos relevantes.
4. Actualizar el ERS con requisitos, alcance final y trazabilidad. Cerrar el documento
   de cobertura de testing con casos, resultados, mocks, exclusiones y análisis.
5. Preparar el comprimido del proyecto y verificar los entregables y el enlace GitHub.
6. Preparar y ensayar la defensa individual, mostrando las 10 pruebas seleccionadas.

La siguiente etapa de implementación es entrenamiento y rutina.
El tiempo pendiente depende del alcance de los módulos restantes; estos porcentajes
no permiten deducir un número de horas o días con fiabilidad.
