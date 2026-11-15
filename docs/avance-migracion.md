# Avance de la migración KYNEX

## Desarrollo de EP3

Corte del 15 de noviembre de 2026. La actualización se desarrolla en `codex/ep3-integracion`; los cambios pendientes se mantienen en una propuesta de integración para revisión. El repositorio público del servidor es [kynex-backend](https://github.com/AlexanderLlanten/kynex-backend), rama `codex/ep3-base`.

Verificado: Spring Boot y PostgreSQL; migraciones; CRUD de productos y categorías con baja lógica y versión; registro completo; JWT, renovación y logout; sesión recuperable y gestión de productos en React. El bloque comercial añade carrito por propietario y conciliación del visitante, dirección de entrega, pedidos históricos, cinco resultados de pago académico e historial propio. Administrador consulta, avanza y anula pedidos con motivo; Vendedor consulta. La aprobación y la restitución de stock son transaccionales e idempotentes.

Usuarios y perfil: CRUD administrativo con baja lógica y reactivación, contraseña inicial elegida, edición de datos propios y control de versiones. Las bajas revocan las sesiones y preservan carritos y compras. Se bloquean cambios del rol propio y la desactivación propia; la coordinación en PostgreSQL protege los cambios de administración entre procesos. El perfil no admite id, rol, estado ni contraseña enviados por el navegador.

Categorías: listado, alta, edición y baja lógica desde React, con rutas y menús exclusivos de Administrador. La edición y la baja envían versión; los conflictos conservan el borrador. Se rechaza la baja con productos activos y el bloqueo de categoría evita inconsistencias al crear un producto simultáneamente. Un índice Unicode de PostgreSQL 18 protege nombres con mayúsculas acentuadas y formas equivalentes. La tienda y el carrito reconsultan las etiquetas tras un cambio y al volver a la ventana.

Entrenamiento: ocho ejercicios e imágenes preservados en el backend; CRUD administrativo con baja lógica y reactivación; biblioteca pública con filtros. Las rutinas pertenecen al usuario autenticado y permiten alta, selección, renombre, prescripción, retirada, vaciado y eliminación. Los límites son 20 rutinas por cuenta, 100 ejercicios por rutina, 1–20 series y 1–100 repeticiones. Un ejercicio desactivado se conserva con aviso en las rutinas previas; los valores sugeridos no reemplazan ajustes personales.

Contacto: recepción pública persistida, referencia UUID idempotente y confirmación posterior a la transacción. El reintento del mismo mensaje no crea otra solicitud ni reinicia su atención. Administrador dispone de bandeja paginada, filtro por estado, detalle, notas internas e historial de atención; Cliente y Vendedor no acceden. Resolver exige nota; reabrir conserva el historial. Los cambios incluyen versión y conservan el borrador ante conflictos. No se anuncian correos enviados.

Resultados: 134 pruebas de API con PostgreSQL y 724 pruebas de React en 97 archivos aprobadas; ambos builds completados. Se conserva la evidencia previa. Edge comprobó recepción pública, pérdida de respuesta y reintento sin duplicar, atención, historial, reapertura, otra sesión, conflicto sin pérdida, filtros y logout. Contacto y su detalle se revisaron a 390, 768 y 1366 px. Una regresión específica verifica que la recuperación inicial de sesión no desmonte el formulario del visitante. Swagger describe el envío público y los recursos protegidos. El ERS V3 mantiene 32 RF y 21 RNF y actualiza su estado.

Pendiente: operación, copia y restauración y aceptación completa en otro equipo. El modo predeterminado sigue siendo local. `VITE_DATA_SOURCE=api` conecta cuentas, perfil, usuarios, categorías, catálogo, compra, entrenamiento y contacto sin registros locales como respaldo del servidor. El emulador requiere `PAYMENT_EMULATOR_ENABLED=true`. Los pedidos son comprobantes académicos internos, sin emisión tributaria ni cobros reales.

La autoevaluación técnica EP3 pasa de **85% a 93%**, con un margen pendiente estimado del **7%**. Contacto completa el recurso funcional que faltaba y Swagger distingue las rutas públicas y protegidas. La API sube de 60% a 100% en la escala de la pauta, que no contempla 80% para este indicador. Modelo e integración conservan margen por aceptación y operación. Es un juicio sobre evidencia, no una calificación, horas ni cobertura de código.

| Indicador EP3 | Peso en el encargo | Nivel estimado | Aporte |
| --- | ---: | ---: | ---: |
| IE3.1.1 Backend, modelos y negocio | 20% | 80% | 16 |
| IE3.2.1 API CRUD y Swagger | 20% | 100% | 20 |
| IE3.2.2 Integración REST | 15% | 80% | 12 |
| IE3.3.1 JWT y roles | 15% | 100% | 15 |
| IE3.3.2 Sesión persistente | 15% | 100% | 15 |
| IE3.3.3 Restricciones en React | 15% | 100% | 15 |
| **Total estimado** | **100%** | | **93%** |

La integración se valora en 80% por los recorridos completos de cuentas, compra, catálogo, entrenamiento y contacto; las restricciones se verifican también en estas pantallas. Modelo e integración mantienen margen por aceptación externa y operación. La sesión y autorización se valoran sobre los escenarios probados; no equivalen a una certificación de seguridad. El encargo pesa 40% de EP3; la presentación individual, 60%, se evalúa por separado.

Los porcentajes posteriores corresponden al antecedente de EP2.

## Antecedente del cierre de EP2

Corte final: 26 de octubre de 2026. Rama: `feature/react-migration`.

## Estado de cierre

- **Migración de pantallas: 20 de 20, 100%.** No faltan pantallas del inventario por incorporar a React.
- **Autoevaluación técnica frente al encargo: 95%; margen pendiente estimado: 5%.** Es un juicio de revisión sobre la rúbrica, no una calificación ni un porcentaje de horas.
- Código, ERS V2, documento de cobertura, guía de defensa y fuentes para el ZIP preparados. El alcance académico Front End está implementado y verificado en los escenarios descritos.
- Continúan pendientes comprobaciones de aceptación ligadas al entorno: reproducción externa, matriz de navegadores y mediciones de rendimiento. La preparación material de la defensa no equivale a haberla presentado.

El 81% del corte anterior queda como antecedente: faltaban auditoría transversal,
documentación final y evidencia de una instalación limpia. Esas tareas se cerraron.
No se declara un 100% de cumplimiento de todos los requisitos del ERS.

## Fuente y método de la autoevaluación

Fuente: **DSY1104 Evaluación Parcial 2_EE_EP_Estudiante.pdf**, instrucciones y
entregables de páginas 2–4 e indicadores de páginas 6–9. La EP2 pesa 30% de la
asignatura; dentro de EP2 el encargo pesa 40% y la presentación individual 60%.
El estudiante confirmó autorización del docente para usar Vitest en lugar de Jasmine/Karma.

Se usan los niveles de la rúbrica y sus ponderaciones. La asignación es una
estimación revisable del trabajo, sujeta a la valoración del docente.

| Indicador del encargo | Peso EP2 | Nivel estimado | Aporte | Evidencia y límite |
| --- | ---: | ---: | ---: | --- |
| IE2.1.1 Aplicación con framework JS | 10% | 80% | 8,0 | 20 pantallas React, instalación limpia y build correctos. Se conserva un margen por aceptación completa del video, compatibilidad y objetivos de rendimiento del ERS. |
| IE2.1.2 Componentes, props, estado y Bootstrap responsivo | 10% | 100% | 10,0 | Atomic Design, Context, layouts y rutas compartidos; 66 comprobaciones en tres tamaños. Etiquetas de stock móvil corregidas. El nivel describe los escenarios revisados, no todos los dispositivos. |
| IE2.2.1 Pruebas de lógica y comportamiento | 12% | 100% | 12,0 | 597 casos aprobados; diez ejemplos concretos explicados en la guía, con DOM, interacción y reglas. La suite contiene unitarias e integración. |
| IE2.3.1 Proceso, mocks, resultados y cobertura | 8% | 100% | 8,0 | Entorno reproducible, mocks, informe independiente, medición V8 y análisis de exclusiones y ramas pendientes. El nivel estimado no exige ni afirma ejecutar cada línea o rama. |
| **Encargo** | **40%** | | **38,0 / 40** | **38 ÷ 40 × 100 = 95%. Margen estimado: 2 / 40 = 5%.** |

Los niveles máximos son autoevaluaciones de la evidencia disponible, no notas
concedidas. La cobertura de líneas de 98,98% es otra medida y no entra en esta fórmula.
El 5% tampoco representa una lista exacta de tareas ni permite calcular horas restantes.

## Verificación y entregables

| Elemento | Resultado |
| --- | --- |
| Clon público y npm ci | Correctos, con Node 24.22.1 y npm 11.19.1 |
| Regresión de cierre | 80 archivos, 597 aprobadas, 0 fallidas y 0 omitidas tras la limpieza |
| Cobertura | Sentencias 97,91%; ramas 94,74%; funciones 99,30%; líneas 98,98% |
| Producción | Build correcto en clon limpio y después del ajuste CSS |
| Navegador | 22 rutas/variantes × 3 tamaños, además de roles, formularios, persistencia y cinco errores de ruta |
| ERS | Versión 2 ejecutiva, 24 RF y 17 RNF con criterios y límites explícitos |
| Testing | Informe Word y versión Markdown con resultados, mocks, diez casos y riesgos residuales |
| Defensa | Guía con comandos y explicación de diez pruebas |

La cobertura vigente se midió sobre `024096d` después de retirar 51 archivos
antiguos y conservar la referencia histórica de productos como dato de testing.
Las 597 pruebas aprobaron. La compilación produce los mismos 24 archivos que antes
de la limpieza. El ERS y el informe de testing registran los elementos retirados
y sus reemplazos con redacción ejecutiva y en tercera persona.

La evidencia vigente se conserva en [testing de limpieza](evidencias/testing-limpieza.json),
[cobertura de limpieza](evidencias/coverage-limpieza.json) y
[registro de sustituciones](limpieza-legacy.md). Los cortes anteriores se mantienen como antecedente.

Referencias: [auditoría final](auditoria-final.md), [paridad EP1](paridad-ep1.md),
[informe de testing](cobertura-testing.md), [guía de defensa](guia-defensa.md),
[ERS V2](entrega/ERS_KYNEX_V2.docx) e
[informe Word](entrega/Cobertura_Testing_KYNEX.docx).

## Presentación individual

| Indicador | Peso EP2 | Preparación disponible |
| --- | ---: | --- |
| IE2.1.3 Explicar el diseño y framework | 15% | Recorrido de arquitectura y rutas en la guía |
| IE2.1.4 Explicar componentes, props, estado y Bootstrap | 20% | Ejemplos de ProductCard, Navbar, Context y revisión responsiva |
| IE2.2.2 Demostrar diez pruebas | 15% | Diez casos reales con comandos y aserciones |
| IE2.3.2 Explicar proceso y resultados | 10% | Informe de testing, mocks, cobertura y limitaciones |

El ensayo y la presentación están pendientes del estudiante. No se asigna logro a
una exposición que no se ha observado. El 95% técnico no significa 95% de la EP2.

## Lo que falta para afirmar aceptación completa

1. Comprobar el video en el navegador de presentación: YouTube mostró restricción y código 151 en este entorno.
2. Completar la matriz Chrome, Edge, Firefox y Safari y medir los objetivos de 3 s/300 ms con condiciones definidas.
3. Ensayar la defensa, revisar el paquete en el equipo de presentación y efectuar la entrega por el canal del docente.

Back End, pagos, contacto con envío real y pedidos transaccionales son evolución
futura, no se añaden para cerrar esta migración Front End.

## Frecuencia de pruebas

No es necesario ejecutar las 597 pruebas después de cada cambio o descarga.
Seleccionar el módulo afectado durante el desarrollo. Ejecutar la suite completa
ante cambios compartidos, conflictos o fallos; generar cobertura al actualizar la
evidencia final. La actualización de informes ya incluye la regresión sobre el
código vigente; los cambios exclusivos de documentación se verifican mediante
revisión editorial, visual y de consistencia de datos.
