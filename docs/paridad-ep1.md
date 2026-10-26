# Revisión de paridad con EP1

Corte: 26 de octubre de 2026. Rama: `feature/react-migration`.

Esta etapa contrasta directamente catálogo, detalle de producto e Inicio. Se usan
los HTML y módulos originales conservados en `pages/`, `admin/` y `assets/js/`;
el Inicio anterior a Vite se consulta con `git show 3d43937:index.html`.
La matriz también identifica las 20 pantallas y sus rutas actuales. Para los demás
módulos se registra la migración y sus pruebas previas, sin afirmar una revisión
manual exhaustiva de cada elemento visual en este corte.

## Inventario y hallazgos

| Pantalla original | Ruta React | Estado y evidencia |
| --- | --- | --- |
| Inicio | `/` | Migrado con pruebas; quedan bloques y accesos del Inicio original, detallados abajo. |
| Catálogo | `/productos` | Contrastado: búsqueda por nombre, descripción, categoría y código, filtro, contador, imágenes y objetivos. |
| Detalle de producto | `/productos/:id` | Contrastado: ficha completa, imágenes, cantidad por adición y stock restante. |
| Carrito | `/carrito` | Reglas y persistencia con pruebas; falta recuperar el aviso del botón Continuar compra. |
| Login | `/login` | Migrado; pruebas de autenticación y retorno seguro. |
| Registro | `/registro` | Migrado; pruebas de validaciones, región/comuna y persistencia. |
| Contacto | `/contacto` | Migrado; validación local como en EP1, sin envío. |
| Nosotros | `/nosotros` | Migrado; pruebas de contenido, categorías y navegación. |
| Blog | `/blog` | Migrado; dos tarjetas y fotografías originales, con pruebas. |
| Creatina y rendimiento | `/blog/creatina-y-rendimiento` | Migrado; cuerpo, listas, nota y lectura directa con pruebas. |
| Recuperación muscular | `/blog/recuperacion-muscular` | Migrado; cuerpo, listas, nota y lectura directa con pruebas. |
| Entrenamiento | `/entrenamiento` | Migrado; ocho ejercicios, imágenes, filtros y selección con pruebas. |
| Rutina | `/rutina` | Migrada; ajustes, persistencia, eliminación y confirmación con pruebas. |
| Panel | `/admin` | Migrado; permisos y accesos a módulos con pruebas. |
| Lista de usuarios | `/admin/usuarios` | Migrada; CRUD, permisos y sincronización con pruebas. |
| Formulario de usuario | `/admin/usuarios/nuevo`, `/admin/usuarios/:id/editar` | Migrado; validaciones y conflictos con pruebas. |
| Lista de productos | `/admin/productos` | Migrada; permisos, stock y catálogo compartido con pruebas. |
| Formulario de producto | `/admin/productos/nuevo`, `/admin/productos/:id/editar` | Migrado; validaciones y conservación de metadatos con pruebas. |
| Pedidos | `/admin/pedidos` | Migrado; consulta demostrativa y permisos con pruebas. |
| Detalle de pedido | `/admin/pedidos/:id` | Migrado; datos históricos y cálculos con pruebas. |

20 de 20 pantallas tienen ruta React. Este conteo no cierra la paridad ni los entregables.

## Corregido en catálogo y detalle

- Los seis productos incorporan todos los campos de la EP1, incluidos objetivos,
  características, ingredientes, alérgenos, beneficios, uso, nutrición, certificaciones
  y advertencia. Una prueba compara la estructura completa con los datos originales.
- ProductImage usa la imagen personalizada primero y la original por código cuando
  falta. Un manifiesto de recursos resuelve rutas antiguas a las URL versionadas del
  build; conserva el icono si no hay recurso o la imagen falla. Al agregar imágenes
  locales nuevas hay que registrar su ruta en `src/data/assetImages.js`.
- Un catálogo guardado por las primeras etapas React puede carecer de la ficha.
  `completeProductDetails` completa solo los nueve campos de detalle ausentes y solo
  cuando coinciden id y código con un producto original. Leer no escribe en Storage.
  Se conservan nombre, precio, stock, descripción, imagen y valores explícitos como
  `[]`, `null`, texto vacío u objetos parciales. Otros productos no reciben esa ficha.
- La información se representa con JSX, encabezados, listas y tabla con encabezados
  de fila y columna. Cero calorías permanece visible; datos ausentes no se convierten
  en cero ni en una afirmación de ausencia de alérgenos. Se conserva el alcance
  demostrativo y los textos originales.
- Se recupera la selección de 1 a 10 unidades por adición. La cantidad también se
  limita al stock que queda después del carrito; un agotado o stock ya completo
  bloquea la adición. Cambiar de producto reinicia cantidad y aviso. El mensaje informa
  las unidades realmente agregadas, incluso si se reduce el stock desde otra pestaña.
- La búsqueda vuelve a incluir código y categoría. Las tarjetas conservan formato y
  sabor y muestran los primeros dos objetivos originales. El detalle se adapta a móvil
  y evita el desbordamiento producido por el gutter de la fila introductoria.

## Comprobación de esta etapa

- Selección rápida: `npm test -- productDetails ProductInformation ProductImage ProductDetailPage ProductsPage QuantitySelector CatalogParity`:
  7 archivos, 36 pruebas aprobadas.
- Regresión con cobertura: 79 archivos, 574 pruebas aprobadas. Build de producción correcto.
- Navegador sobre `vite preview`: seis imágenes del catálogo cargadas desde recursos
  versionados; búsqueda por `KYN002`; ficha de creatina con 0 kcal; adición de tres
  unidades y conservación en el carrito. La compra de prueba mantiene también el
  producto ficticio QA preexistente.
- Detalle en escritorio de 1280 × 800 y móvil de 390 × 844, con tabla dentro del ancho;
  recarga directa de Whey en tableta de 768 × 1024, con Leche/Soya, 120 kcal y 24 g.
  Sin errores ni advertencias de consola en el recorrido revisado.
- Pruebas aisladas de datos anteriores, personalizaciones, productos nuevos sin ficha,
  tipos inesperados, edición administrativa, stock agotado, cambios de catálogo,
  selección máxima, cambio de id y rechazo de notación exponencial en ids.

## Pendientes para el siguiente corte

1. Completar Inicio: accesos a Entrenamiento y Nosotros, objetivos, bloque de
   entrenamiento/rutina con su imagen, contenido audiovisual, artículos y CTA de
   registro. El Inicio original contiene estos bloques; la ruta React todavía
   presenta una composición reducida. Los objetivos originales llevan al catálogo
   completo; no se les atribuye un filtro por objetivo que la EP1 no implementa.
2. Recuperar un aviso accesible al pulsar Continuar compra. La EP1 solo informa que
   checkout se implementará después; React conserva el botón pero todavía no muestra
   ese aviso. No corresponde convertirlo en un pago o pedido real durante la migración.
3. Completar la revisión transversal del resto de pantallas y estados antes de cerrar
   ERS, trazabilidad, documento de testing y paquete final.

La autoevaluación técnica sigue siendo conservadora: 81% del encargo, con 19%
ponderado pendiente. No mide horas restantes ni equivale a la calificación de EP2.
