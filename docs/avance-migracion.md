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
| IE2.1.1: aplicación con framework JS | 10% | 60% | 6,0 | React/Vite/Router funcional y estructura Atomic Design. Quedan páginas, administración, integración de datos editables y cierre del ERS. |
| IE2.1.2: componentes, props, estado y Bootstrap responsivo | 10% | 80% | 8,0 | Layout, carrito, autenticación y formularios reutilizables; revisión visual de escritorio y móvil. Falta aplicar y revisar esta estructura en todos los módulos restantes. |
| IE2.2.1: pruebas de lógica y comportamiento | 12% | 100% | 12,0 | 195 pruebas correctas, con componentes, DOM, eventos, servicios y recorridos integrados; superan las 10 pruebas del descriptor máximo. Se deberán agregar casos para cada módulo nuevo. |
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
| Administración: inicio, usuarios, formulario de usuario, productos, formulario de producto, pedidos y detalle de pedido | 7 | Pendientes |
| **Total** | **20** | **6 migradas / 14 pendientes** |

Además de pantallas, falta aplicar los permisos de Cliente/Vendedor/Administrador
mediante rutas protegidas y conectar la administración con los mismos datos de la
tienda. `hasRole` y la recuperación de sesión ya existen; no sustituyen esas rutas.

## Verificación realizada en esta etapa

- `npm test` en la suite completa mediante `npm run test:coverage`: **34 archivos,
  195 pruebas aprobadas, 0 fallidas**.
- `npm run build`: compilación de producción correcta.
- Navegador: validación de formulario vacío, creación de cliente con datos ficticios,
  confirmación visible y Login con la cuenta nueva.
- Vista de escritorio y móvil de 390 × 844; campos dentro del ancho disponible y sin
  errores o advertencias capturados en la consola durante el recorrido.
- Prueba automatizada del recorrido Carrito > Login > Registro > Login > Carrito,
  conservando las cantidades, el destino de origen y el rol Cliente.

### Cobertura medida

| Métrica | Cubierto / total | Porcentaje |
| --- | ---: | ---: |
| Sentencias | 460 / 471 | 97,66% |
| Ramas | 343 / 376 | 91,22% |
| Funciones | 145 / 145 | 100% |
| Líneas | 434 / 443 | 97,96% |

La configuración incluye `src/**/*.{js,jsx}`, excluyendo `src/main.jsx` y los
auxiliares de `src/test`. Vitest excluye los archivos de pruebas de la instrumentación.
El resultado no mide HTML/JavaScript heredado, CSS, comportamiento visual ni módulos
que todavía no se implementan. **97,96% de líneas no significa 97,96% de migración.**

Las principales ramas residuales están en CartContext y utilidades de carrito
(65,21% y 68,18% de ramas, respectivamente), además de condiciones alternativas en
componentes de presentación. Antes del cierre conviene revisar persistencia dañada,
operaciones con productos inexistentes y límites de cantidades; su existencia en
la aplicación no queda garantizada por el porcentaje global. No hay pruebas de
permisos administrativos porque sus rutas todavía no se han migrado.

Los informes HTML y JSON se regeneran en `coverage/` con `npm run test:coverage`;
se mantienen fuera del historial Git. Este documento conserva la medición de corte.

### Diez ejemplos disponibles para preparar la defensa

| Caso | Evidencia en el repositorio |
| --- | --- |
| Datos recibidos mediante props en una tarjeta | `src/components/molecules/ProductCard.test.jsx` |
| Callback al agregar un producto | `src/components/molecules/ProductCard.test.jsx` |
| Límite de cantidad por stock | `src/utils/cart.test.js` |
| Regla de despacho gratuito | `src/utils/cart.test.js` |
| Filtrado de catálogo por búsqueda | `src/pages/ProductsPage.test.jsx` |
| Estado del menú móvil y navegación | `src/components/organisms/Navbar.test.jsx` |
| Sesión y rol sincronizados entre pestañas | `src/context/AuthContext.test.jsx` |
| Error de almacenamiento simulado | `src/services/register.test.js` |
| Región y comuna dependientes | `src/components/organisms/RegistrationForm.test.jsx` |
| Registro, Login y regreso al carrito | `src/App.test.jsx` |

## Trabajo restante y orden propuesto

1. Rutas protegidas y permisos; luego layout y pantallas administrativas de usuarios,
   productos y pedidos. Integrar cambios del catálogo con la tienda y conservar la
   compatibilidad de los datos de EP1.
2. Contacto, entrenamiento, rutina, nosotros, blog y artículos. Completar enlaces,
   recursos del catálogo y paridad funcional con el proyecto original.
3. Revisar navegación directa, rutas inexistentes, persistencia y responsividad en
   el alcance completo; ejecutar regresión y cobertura final con casos relevantes.
4. Actualizar el ERS con requisitos, alcance final y trazabilidad. Cerrar el documento
   de cobertura de testing con casos, resultados, mocks, exclusiones y análisis.
5. Preparar el comprimido del proyecto y verificar los entregables y el enlace GitHub.
6. Preparar y ensayar la defensa individual, mostrando las 10 pruebas seleccionadas.

La siguiente etapa de implementación es la protección de rutas y permisos por rol.
El tiempo pendiente depende del alcance de los módulos restantes; estos porcentajes
no permiten deducir un número de horas o días con fiabilidad.
