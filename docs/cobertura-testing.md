# Cobertura del testing

KYNEX · Informe ejecutivo de calidad
Versión 2 · 26 de octubre de 2026
Alexander Llantén Sepúlveda · Full Stack 2

## Resumen ejecutivo

La versión evaluada de KYNEX aprobó las 597 pruebas automatizadas, sin fallos ni omisiones. La ejecución incluye la corrección que permite visualizar fotografías en el carrito y conserva los comportamientos de compra, usuarios, administración, contenido y entrenamiento.

El resultado respalda el funcionamiento de los escenarios comprobados. La cobertura identifica el código ejecutado durante las pruebas y permite priorizar verificaciones adicionales; no representa un porcentaje de requisitos cumplidos ni garantiza la ausencia de defectos.

La suite reúne 80 agrupaciones de prueba. La compilación de producción se completó correctamente.

## Cobertura de código

| Métrica | Elementos cubiertos | Cobertura |
| --- | --- | --- |
| Sentencias | 1314 de 1342 | 97,91% |
| Ramas de decisión | 1046 de 1104 | 94,74% |
| Funciones | 431 de 434 | 99,30% |
| Líneas | 1077 de 1088 | 98,98% |

Las líneas indican instrucciones alcanzadas; las ramas distinguen alternativas de decisión. El análisis conjunto evita interpretar una cobertura alta de líneas como verificación completa de todos los comportamientos posibles.

## Entorno de evaluación

La ejecución utilizó Windows, Node.js 24.22.1, npm 11.19.1, Vitest 5.0.5 y jsdom 30.1.3. React Testing Library y userEvent permitieron comprobar el contenido visible y las interacciones. La medición se realizó con el proveedor V8.

## Alcance y metodología

La estrategia combina pruebas unitarias de componentes y reglas de negocio con pruebas de integración de navegación, proveedores de estado y servicios. Los casos verifican datos válidos e inválidos, eventos, permisos, persistencia, sincronización y recuperación ante errores.

| Área de verificación | Pruebas |
| --- | --- |
| Componentes de interfaz y plantillas | 140 |
| Páginas | 35 |
| Estado compartido | 27 |
| Control de rutas | 15 |
| Servicios de datos | 115 |
| Utilidades y validaciones | 96 |
| Recorridos integrados de la aplicación | 169 |
| Total | 597 |

### Ejecución y aislamiento

Cada caso organiza la preparación de datos, la acción y la comprobación del resultado. Los conjuntos con persistencia reinician el almacenamiento y restauran los dobles utilizados para evitar interferencias entre casos.

### Dobles de prueba

Los mocks registran llamadas y argumentos de los eventos. Los espías sobre el almacenamiento provocan fallos controlados para comprobar que una operación no deje datos parciales ni elimine información previa. El control de fechas permite resultados deterministas cuando los casos lo requieren.

El entorno simulado sustituye capacidades de desplazamiento y diálogos que no reproduce de forma nativa. Estas sustituciones permiten verificar estados y mensajes, mientras la apariencia y la interacción visual se comprueban por separado en navegador.

### Frecuencia de verificación

Durante una modificación se ejecutan las pruebas del área afectada. Los cambios compartidos y el cierre de una versión requieren regresión completa; la cobertura se vuelve a medir cuando se actualiza la evidencia de calidad.

## Casos representativos y resultados

Los siguientes diez casos forman parte de la ejecución aprobada y muestran verificaciones de presentación, interacción, reglas y recuperación. La selección permite explicar qué condición se prepara, qué acción ocurre y qué resultado se espera.

| Caso | Comportamiento comprobado | Resultado |
| --- | --- | --- |
| 1 · Datos del producto | La tarjeta presenta nombre, categoría y precio recibidos mediante propiedades. | Aprobado |
| 2 · Acción de agregar | El evento entrega el producto correcto al callback asociado al carrito. | Aprobado |
| 3 · Producto agotado | Un stock de cero muestra el estado Sin stock, por encima de la alerta de stock crítico. | Aprobado |
| 4 · Cantidades bloqueadas | Los controles deshabilitados no ejecutan callbacks de aumento o disminución. | Aprobado |
| 5 · Despacho gratuito | Dos unidades de $39.990 generan despacho cero y total de $79.980. | Aprobado |
| 6 · Búsqueda de catálogo | La escritura en el buscador muestra coincidencias y retira productos ajenos al criterio. | Aprobado |
| 7 · Menú móvil | La apertura y el cierre actualizan el estado accesible; la navegación cierra el menú. | Aprobado |
| 8 · Región y comuna | Cambiar la región reinicia la comuna y limita las opciones a la nueva selección. | Aprobado |
| 9 · Acceso protegido | Una visita sin sesión recibe acceso a autenticación y no monta el contenido privado. | Aprobado |
| 10 · Fallo de almacenamiento | Un error al guardar el perfil propio conserva los usuarios y revierte la sesión anterior. | Aprobado |

## Corrección de las imágenes del carrito

La verificación detectó que el carrito utilizaba un ícono fijo. La corrección incorporó el componente compartido de imágenes y ajustó la miniatura a su contenedor. Dos aserciones reprodujeron el fallo antes del cambio; después aprobaron los nueve casos relacionados y la regresión completa.

La revisión de navegador confirmó la fotografía después de recargar, tanto en 1280 × 900 como en 390 × 844 píxeles, sin desbordamiento horizontal ni errores de consola en ese recorrido.

## Evaluación de resultados y límites

## Revisión funcional en navegador

La revisión transversal cubrió 22 rutas y variantes de las 20 pantallas, en tres tamaños de pantalla. Las 66 comprobaciones no detectaron desbordamiento horizontal de página ni errores en imágenes que habían terminado de cargar. También se revisaron cinco destinos inexistentes, permisos por perfil, formularios, menú móvil y persistencia de carrito y rutina.

La revisión administrativa comprobó creación, edición y eliminación de un producto de prueba, incluida la cancelación previa del borrado. La aplicación conservó compra y rutina al recargar y cerrar sesión. Estas observaciones corresponden a los estados recorridos en un navegador basado en Chromium.

## Riesgos residuales

| Zona | Cobertura de ramas | Aspecto pendiente |
| --- | --- | --- |
| Reglas del carrito | 68,18% | Combinaciones alternativas de entradas y normalización. |
| Estado del carrito | 84,61% | Variantes de decisión sobre datos y recuperación. |
| Construcción de rutina | 78,94% | Alternativas de error y recuperación en la interfaz. |

Las próximas ampliaciones de pruebas deberán priorizar escenarios observables y límites de negocio. El aumento de un porcentaje, por sí solo, no demuestra una mejora de calidad.

## Exclusiones y aceptación pendiente

La instrumentación excluye el punto de arranque, los auxiliares de prueba y las propias pruebas. La medición no acredita estilos, servicios externos, rendimiento real ni comportamiento en todos los navegadores. El entorno simulado tampoco reproduce íntegramente el diseño visual o las tecnologías de asistencia.

Continúan pendientes la matriz Chrome, Edge, Firefox y Safari, las mediciones de carga de 3 segundos y respuesta inferior a 300 milisegundos, y la reproducción del video externo, cuyo proveedor mostró restricción con código 151.

La versión presenta resultados satisfactorios dentro del alcance académico Front End y de los escenarios evaluados. Su aceptación integral queda condicionada a completar las comprobaciones anteriores. La operación productiva requerirá servicios de servidor y controles adicionales de seguridad y persistencia.

## Verificación tras la depuración

La eliminación de 51 archivos antiguos se verificó mediante revisión de dependencias, regresión automatizada y comparación de la compilación. Las responsabilidades retiradas ya están cubiertas por la implementación React vigente.

| Elemento retirado | Cantidad | Reemplazo vigente |
| --- | ---: | --- |
| Pantallas HTML | 19 | Páginas React y navegación con React Router; plantillas públicas y administrativas compartidas. |
| Hojas de estilo CSS | 7 | Estilos de la aplicación React y Bootstrap, manteniendo la identidad visual KYNEX. |
| Módulos JavaScript | 25 | Componentes, estado compartido, hooks, servicios, validaciones y datos del catálogo React. |

### Preservación de la prueba del catálogo

Una prueba todavía dependía del módulo antiguo de productos. Sus seis registros completos se conservaron como una referencia histórica independiente, exclusiva de testing. La prueba compara todos los campos con el catálogo vigente sin utilizar código de la implementación retirada.

### Resultados posteriores al retiro

La regresión aprobó 597 pruebas distribuidas en 80 agrupaciones, sin fallos ni omisiones, en 109,92 segundos. La cobertura se mantiene en 97,91% de sentencias, 94,74% de ramas, 99,30% de funciones y 98,98% de líneas. Los archivos retirados no pertenecían al código instrumentado de la aplicación React.

La compilación finalizó correctamente. Sus 24 archivos coinciden byte a byte con la salida previa a la limpieza. También se verificó la conservación de las 19 imágenes y la ausencia de dependencias hacia los módulos eliminados.

### Alcance de la evidencia

La revisión visual anterior corresponde al mismo resultado compilado; la comparación no constituye una nueva evaluación de navegador. Permanecen las condiciones pendientes de rendimiento, compatibilidad y reproducción multimedia. El historial Git conserva la implementación retirada.
