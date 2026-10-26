# Avance de la migración KYNEX

Fecha de corte: 26 de octubre de 2026. Rama: `feature/react-migration`.

## Dos medidas distintas

- **Autoevaluación técnica frente a la pauta: 81%; pendiente estimado: 19%.**
  Se calcula sobre los cuatro indicadores del encargo, cuyo peso conjunto es 40%
  de la evaluación. Es una estimación de cumplimiento, no una calificación del docente
  ni un porcentaje de horas de trabajo realizadas.
- **Migración de pantallas: 6 de 20, equivalente a 30%; faltan 14, equivalente a 70%.**
  Cuenta cada pantalla HTML original una vez, incluido el inicio. No pondera el
  esfuerzo: la base compartida, carrito, autenticación, formularios y pruebas ya
  implementadas se reutilizarán en las pantallas siguientes. Tampoco implica paridad
  completa de todo el contenido y los recursos visuales de cada pantalla.

La diferencia se debe al peso que la pauta da a componentes y testing. Cumplir esos
indicadores puede avanzar antes de terminar todas las pantallas. Para planificar el
trabajo pendiente de migración hay que considerar ambas medidas.

En este corte se completaron la base de permisos, ProtectedRoute, RoleGate y la
integración de `/admin` con un layout y resumen iniciales. La cifra de pantallas se
mantiene en 6/20: el panel aún debe recuperar los accesos a los módulos originales
cuando se migren. El 81% también se mantiene porque los niveles ponderados de los
indicadores todavía no cambian. Agregar esta infraestructura no justifica declarar
terminadas las pantallas administrativas.

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
| IE2.1.1: aplicación con framework JS | 10% | 60% | 6,0 | React/Vite/Router funcional, Atomic Design y panel inicial protegido. Quedan páginas, gestión administrativa, integración de datos editables y cierre del ERS. |
| IE2.1.2: componentes, props, estado y Bootstrap responsivo | 10% | 80% | 8,0 | Layouts público y administrativo, carrito, autenticación y formularios reutilizables; revisión visual de escritorio y móvil. Falta aplicar y revisar esta estructura en todos los módulos restantes. |
| IE2.2.1: pruebas de lógica y comportamiento | 12% | 100% | 12,0 | 245 pruebas correctas, con componentes, DOM, eventos, permisos, servicios y recorridos integrados; superan las 10 pruebas del descriptor máximo. Se deberán agregar casos para cada módulo nuevo. |
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
| Contacto, nosotros, blog y dos artículos | 5 | Pendientes |
| Entrenamiento y rutina | 2 | Pendientes |
| Administración: inicio, usuarios, formulario de usuario, productos, formulario de producto, pedidos y detalle de pedido | 7 | Panel inicial y layout disponibles; paridad del panel y 6 pantallas de gestión pendientes |
| **Total** | **20** | **6 migradas / 14 pendientes** |

La matriz de permisos y las guardas ya existen. `/admin` y sus rutas desconocidas
exigen ADMIN_ACCESS: Administrador y Vendedor entran; Cliente vuelve a la tienda;
sin sesión se solicita Login. El menú público muestra Administración solo a perfiles
autorizados. La sesión se reevalúa ante cambios de rol, eliminación de usuario y
cierre desde otra pestaña.

USERS_MANAGE y PRODUCTS_MANAGE se reservan al Administrador; PRODUCTS_VIEW y
ORDERS_VIEW permiten también Vendedor. Esas reglas se verifican en la matriz y con
guardas anidadas en pruebas. Falta aplicarlas a las pantallas concretas de gestión
cuando se creen sus rutas React. El resumen del panel usa los productos de la tienda;
la edición compartida de datos aún está pendiente.

## Verificación realizada en esta etapa

- Suite completa mediante `npm run test:coverage`: **40 archivos,
  245 pruebas aprobadas, 0 fallidas**.
- `npm run build`: compilación de producción correcta.
- Navegador: visita anónima a `/admin` enviada a Login; acceso con Administrador y
  Vendedor; Cliente rechazado al abrir el panel directamente; cierre de sesión.
- Vista de escritorio y móvil de 390 × 844; menú administrativo desplegable, contenido
  dentro del ancho disponible y sin errores o advertencias de consola durante el recorrido.
- Regresión automatizada de tienda, registro y carrito, más acceso directo a rutas
  privadas, retorno desde Login con filtros, revocación entre pestañas y cierre de
  sesión conservando la compra.
- Una prueba de layout detectó una consulta ambigua: el nombre y el rol de la cuenta
  de demostración contienen «Administrador». Se corrigió la expectativa para comprobar
  ambas apariciones; la suite completa posterior pasó.

### Cobertura medida

| Métrica | Cubierto / total | Porcentaje |
| --- | ---: | ---: |
| Sentencias | 494 / 506 | 97,62% |
| Ramas | 376 / 410 | 91,70% |
| Funciones | 161 / 162 | 99,38% |
| Líneas | 464 / 474 | 97,89% |

La configuración incluye `src/**/*.{js,jsx}`, excluyendo `src/main.jsx` y los
auxiliares de `src/test`. Vitest excluye los archivos de pruebas de la instrumentación.
El resultado no mide HTML/JavaScript heredado, CSS, comportamiento visual ni módulos
que todavía no se implementan. **97,89% de líneas no significa 97,89% de migración.**

Las principales ramas residuales están en CartContext y utilidades de carrito
(65,21% y 68,18% de ramas, respectivamente), además de condiciones alternativas en
componentes de presentación. Antes del cierre conviene revisar persistencia dañada,
operaciones con productos inexistentes y límites de cantidades; su existencia en
la aplicación no queda garantizada por el porcentaje global. Los permisos, guardas
y el acceso al panel están cubiertos; faltan los casos de operaciones de los módulos
administrativos que todavía no existen. El callback del enlace al panel y la rama
de navegación con hash del nuevo layout no se ejecutan en esta medición; el menú
móvil se revisó también en navegador.

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
| Error de almacenamiento simulado | `src/services/register.test.js` |
| Región y comuna dependientes | `src/components/organisms/RegistrationForm.test.jsx` |
| Registro, Login y regreso al carrito | `src/App.test.jsx` |

## Trabajo restante y orden propuesto

1. Migrar listas y formularios administrativos de usuarios, productos y pedidos,
   conectando sus permisos y completando el panel. Integrar cambios del catálogo con la tienda y conservar la
   compatibilidad de los datos de EP1.
2. Contacto, entrenamiento, rutina, nosotros, blog y artículos. Completar enlaces,
   recursos del catálogo y paridad funcional con el proyecto original.
3. Revisar navegación directa, rutas inexistentes, persistencia y responsividad en
   el alcance completo; ejecutar regresión y cobertura final con casos relevantes.
4. Actualizar el ERS con requisitos, alcance final y trazabilidad. Cerrar el documento
   de cobertura de testing con casos, resultados, mocks, exclusiones y análisis.
5. Preparar el comprimido del proyecto y verificar los entregables y el enlace GitHub.
6. Preparar y ensayar la defensa individual, mostrando las 10 pruebas seleccionadas.

La siguiente etapa de implementación es la gestión de usuarios reservada al Administrador.
El tiempo pendiente depende del alcance de los módulos restantes; estos porcentajes
no permiten deducir un número de horas o días con fiabilidad.
