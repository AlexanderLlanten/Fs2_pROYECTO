# Avance de la migración KYNEX

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
