# Revisión de paridad con EP1

Corte: 26 de octubre de 2026. Rama: `feature/react-migration`.

La revisión acumulada contrasta directamente catálogo, detalle de producto, Inicio
y el aviso de continuación del carrito. Se usan
los HTML y módulos originales disponibles en el historial Git anterior a la depuración;
el Inicio anterior a Vite se consulta con `git show 3d43937:index.html`.
Los archivos antiguos se retiraron después de completar la migración; el corte
`a7df48b` conserva esos antecedentes y [el registro de limpieza](limpieza-legacy.md)
detalla sus reemplazos. La prueba del catálogo mantiene una referencia histórica
independiente y exclusiva de testing.
La matriz también identifica las 20 pantallas y sus rutas actuales. Para los demás
módulos se registra la migración y sus pruebas previas. El cierre añade la
[auditoría transversal](auditoria-final.md): 22 rutas y variantes en tres tamaños,
roles, formularios y persistencia. No se afirma una comparación exhaustiva de cada
elemento visual o de todos los estados posibles.

## Inventario y hallazgos

| Pantalla original | Ruta React | Estado y evidencia |
| --- | --- | --- |
| Inicio | `/` | Contrastado: bloques, imágenes, objetivos, enlaces, artículos y video original con alternativa externa. Reproducción externa no confirmada. |
| Catálogo | `/productos` | Contrastado: búsqueda por nombre, descripción, categoría y código, filtro, contador, imágenes y objetivos. |
| Detalle de producto | `/productos/:id` | Contrastado: ficha completa, imágenes, cantidad por adición y stock restante. |
| Carrito | `/carrito` | Reglas y persistencia con pruebas; aviso de Continuar compra recuperado y verificado sin operaciones de compra. |
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

20 de 20 pantallas tienen ruta React. La auditoría y documentación de cierre están
preparadas; el conteo no acredita por sí mismo todos los requisitos del ERS.

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

## Corregido en Inicio y continuación de compra

- HomeHero recupera Ver entrenamientos y conserva Explorar productos y Ver destacados.
  Este último solo aparece si hay destacados disponibles, evitando un ancla sin destino.
- FeatureSection/FeatureCard admiten una acción opcional. Inicio recupera Explorar tienda,
  Ver ejercicios y Conocer KYNEX; Nosotros mantiene sus tarjetas informativas sin acción.
- GoalSection presenta Aumento de masa, Energía, Recuperación y Descanso. Los cuatro
  abren `/productos` sin filtros, como los enlaces originales. Los filtros actuales
  por categoría de CategoryGrid se conservan.
- TrainingHighlight recupera la fotografía original y los accesos a Entrenamiento
  y Mi rutina. HomeArticles reutiliza BlogCard, ArticleImage y los datos de los dos
  artículos; cada tarjeta abre su lectura y el conjunto enlaza la portada del Blog.
- La llamada final recupera Crear cuenta y mantiene Ir a la tienda. Los textos del
  bloque de entrenamiento describen la rutina ya disponible en React.
- HomeMedia conserva `https://www.youtube.com/embed/UBMk30rjy0o`, con título accesible,
  proporción 16:9, carga diferida y sin reproducción automática. Se añade apertura
  directa en YouTube. El reproductor externo mostró el código 151 durante la revisión:
  no se confirmó su reproducción ni se sustituyó el contenido por otro video.
- CartSummary reemplaza el `alert` del módulo original por un mensaje local de estado
  anunciado al activar Continuar compra. Mantiene el foco, funciona con teclado y
  se asocia al botón con `aria-describedby`. No crea pedidos, envía peticiones ni
  altera el almacenamiento; el botón está deshabilitado sin productos.
- El gutter horizontal del hero usa `gx-4` para que Inicio permanezca dentro del
  ancho móvil. La composición conserva la paleta, tipografía e imágenes KYNEX.

## Comprobación del corte anterior: catálogo

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

## Comprobación de Inicio y carrito

- `npm test -- HomePage FeatureSection HomeParity CartSummary CartPage`:
  5 archivos, 30 pruebas aprobadas.
- Regresión con cobertura: 80 archivos, 597 pruebas aprobadas. Sentencias 97,91%,
  ramas 94,66%, funciones 99,30% y líneas 98,98%.
- Se agregan 23 pruebas: dos de composición de Inicio, una de acciones opcionales,
  dos del aviso y 18 recorridos integrados. Comprueban destinos, cuatro objetivos,
  cuatro perfiles (incluida visita anónima), recarga, datos guardados, catálogo vacío
  o dañado y aviso sin solicitudes ni escrituras. Las pruebas de video verifican
  el elemento y la URL; jsdom no reproduce contenido externo.
- Build de producción correcto. En `vite preview`, las siete imágenes de Inicio
  cargaron al recorrer la página, incluido entrenamiento y las dos del Blog.
- Inicio a 1280 × 800, 768 × 1024 y 390 × 844 sin desbordamiento horizontal;
  navegación a Entrenamiento, Rutina y un artículo. La rutina mantuvo dos ejercicios
  y diez series. El carrito mantuvo cuatro unidades y total $76.970 después del aviso.
- Aviso revisado en escritorio y móvil; sin errores ni advertencias en la consola
  de la aplicación durante este recorrido. El error del reproductor externo se
  registra por separado y permanece como limitación de esta revisión.

## Cierre transversal

La [auditoría final](auditoria-final.md) incorpora las comprobaciones del resto de
pantallas y los límites observados. Se corrigió la división en líneas de la etiqueta
de stock en la tabla móvil. El clon limpio aprobó las 597 pruebas y el build.
El ERS 2.1 y el documento independiente de testing incorporan esta evidencia.

La reproducción de YouTube sigue sin validarse: el iframe y la página del proveedor
mostraron una restricción que requiere aprobación, código 151. Debe comprobarse en
el navegador de presentación. También quedan la matriz de cuatro navegadores y
las mediciones temporales del ERS. La [autoevaluación](avance-migracion.md) actualiza
la estimación técnica del 81% anterior a 95%, separada del 100% de pantallas migradas
y de la evaluación de la defensa individual.
