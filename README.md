# Fs2_pROYECTO

Frontend KYNEX migrado a React, Vite y React Router. Las 20 pantallas del inventario original tienen ruta React.

Se retiraron los 19 HTML, 7 CSS y 25 módulos JavaScript de la implementación anterior.
La aplicación conserva su entrada `index.html` y las 19 imágenes utilizadas por React.
El [registro de limpieza](docs/limpieza-legacy.md) detalla cada archivo retirado, su
reemplazo y la verificación posterior. El historial Git conserva la versión original.

## Entrega y ejecución en otro equipo

Trabajar con **feature/react-migration**. Esta entrega no modifica `main`.
Se verificaron instalación y build desde un clon nuevo con Node 24.22.1 y npm 11.19.1.

```powershell
git clone --branch feature/react-migration --single-branch https://github.com/AlexanderLlanten/Fs2_pROYECTO.git
cd Fs2_pROYECTO
npm.cmd ci
npm.cmd run dev
```

Abrir la URL que indique Vite. Para comprobar producción: `npm.cmd run build`
y luego `npm.cmd run preview`. Desde el ZIP, extraer y abrir una terminal donde
está `package.json`; ejecutar desde `npm.cmd ci`. El archivo conserva las fuentes
y documentos y omite `.git`, `node_modules`, `dist` y `coverage`.

- [ERS actualizado V2](docs/entrega/ERS_KYNEX_V2.docx).
- [Informe de cobertura en Word](docs/entrega/Cobertura_Testing_KYNEX.docx) y [versión Markdown](docs/cobertura-testing.md).
- [Guía de defensa con diez pruebas](docs/guia-defensa.md).
- [Auditoría final](docs/auditoria-final.md), [evidencias](docs/evidencias/) y [avance frente a la pauta](docs/avance-migracion.md).

**Verificación final:** 597 pruebas aprobadas en 80 archivos; cobertura de líneas
98,98%. La suite completa ya está registrada en la evidencia. No hace falta
repetirla por descargar esta documentación; puede usarse una selección del módulo.
El video externo, la matriz de navegadores y las mediciones de rendimiento tienen
los límites descritos en la auditoría. El sistema conserva su alcance académico.

## Layout público y Atomic Design

- **Átomos:** `BrandLink` reutiliza el enlace de la marca en la cabecera y el pie.
- **Organismos:** `Navbar` y `Footer` reúnen la navegación pública. Navbar obtiene
  `totalItems` desde `useCart`, marca la ruta activa y controla el menú móvil con React.
- **Plantilla:** `PublicLayout` compone Navbar, un único `main` con `Outlet` y Footer.
  Incluye un enlace para saltar al contenido con el teclado.
- **Páginas:** HomePage, ProductsPage, ProductDetailPage y CartPage aportan su contenido
  mediante rutas hijas; no duplican la cabecera, el pie ni el elemento `main`.

`CartProvider` permanece por encima del router para conservar el carrito al navegar.
Las rutas disponibles son `/`, `/productos`, `/productos/:id`, `/carrito`, `/login` y `/registro`.
La navegación compartida enlaza estas rutas ya migradas.
El área privada inicial usa `/admin` con `AdminLayout`; sus rutas hijas requieren
el permiso de acceso administrativo antes de montar el layout.
La gestión de usuarios usa `/admin/usuarios`, `/admin/usuarios/nuevo` y
`/admin/usuarios/:id/editar`, con la guarda específica `USERS_MANAGE`.

## Inicio KYNEX

HomePage recupera el encabezado «Entrena mejor. Supérate.» y la imagen original
de la marca. Compone HomeHero, FeatureSection, CategoryGrid, FeaturedProducts,
GoalSection, TrainingHighlight, HomeMedia y HomeArticles con las moléculas
SectionHeading, CategoryCard, FeatureCard y BlogCard. Los destacados se obtienen del campo
`featured` de los mismos productos usados en el catálogo y se agregan al carrito
compartido, respetando el stock y mostrando una confirmación accesible.

Las categorías abren `/productos?categoria=...`. El selector del catálogo se
sincroniza con ese parámetro y con el historial del navegador; una categoría
desconocida muestra el catálogo completo. El aviso de despacho usa
`FREE_SHIPPING_FROM`, la misma regla que calcula el total del carrito.

Inicio recupera los accesos a tienda, entrenamiento, Nosotros, rutina, Blog y registro,
los cuatro objetivos originales, la fotografía de entrenamiento y los dos artículos.
Los objetivos llevan al catálogo completo, como en EP1. FeatureCard acepta una acción
opcional; las tarjetas informativas de Nosotros conservan su composición sin enlaces.
«Ver destacados» aparece solo cuando existe esa sección. Se mantienen la compra desde
destacados, el enlace al catálogo de la llamada final y los filtros por categoría.

HomeMedia conserva el video original `UBMk30rjy0o` en un iframe con título, carga
diferida y sin reproducción automática. Ofrece abrirlo en YouTube en otra pestaña.
En el navegador de revisión el reproductor externo mostró el código 151: se verificó
la integración y la alternativa, pero no se confirmó la reproducción del video.

## Continuación de compra demostrativa

CartSummary anuncia «El proceso de checkout será implementado en una etapa posterior»
al activar Continuar compra, igual que el alcance del aviso original. Usa una región
de estado accesible asociada al botón, que mantiene el foco y admite teclado. El
carrito vacío no permite continuar. Esta acción no realiza peticiones, escribe datos,
crea pedidos ni cambia la ruta; la compra permanece disponible para seguir editándola.

## Estado de autenticación

`AuthProvider` envuelve al carrito y al router. El hook `useAuth` expone:

| Valor | Uso |
| --- | --- |
| `user` | Identidad de la sesión o `null`: id, nombre, apellido, correo y rol. |
| `isAuthenticated` | Indica si hay una sesión válida. |
| `login(email, password)` | Devuelve `{ success, session }` o `{ success: false, message }`. |
| `register(values)` | Crea un Cliente; devuelve `{ success, user }` o un error con `message` y, cuando corresponde, `errors` por campo. No inicia sesión. |
| `logout()` | Elimina la sesión; conserva usuarios y carrito. Devuelve un resultado con `success`. |
| `hasRole(...roles)` | Consulta uno o varios roles, por ejemplo `hasRole("Administrador", "Vendedor")`. |
| `hasPermission(permission)` | Consulta la matriz central de permisos de administración. |
| `refreshSession()` | Relee una sesión modificada por otro consumidor de la misma pestaña. |

La sesión se recupera al montar el proveedor y se sincroniza entre pestañas mediante
el evento `storage`. Si cambian los usuarios, se actualizan los datos y el rol desde
su registro; una sesión de un usuario eliminado se descarta. Las lecturas de sesión
no inicializan ni sobrescriben usuarios. Los fallos al guardar o eliminar una sesión
devuelven un error y conservan el estado anterior.

El servicio mantiene las claves de la EP1: `kynex_users` y `kynex_session`.
Las cuentas de demostración se inicializan al intentar ingresar o registrar una cuenta, únicamente si
todavía no existe `kynex_users`. Un registro vacío o dañado no se reemplaza por las
cuentas iniciales. La sesión guarda solo identidad y rol, sin contraseña, RUN ni dirección.

| Rol | Correo demostrativo | Contraseña |
| --- | --- | --- |
| Cliente | camila@gmail.com | 1234 |
| Vendedor | martin@duoc.cl | 1234 |
| Administrador | admin@profesor.duoc.cl | 1234 |

Login, Registro, ProtectedRoute y RoleGate consumen este estado.
La autenticación sigue siendo una demostración Front End con datos locales, como en
la EP1: los roles y las credenciales del navegador no constituyen seguridad de producción.
Una versión de producción debe validar credenciales y permisos en un servidor.

## Login

`LoginPage` usa el layout público y compone el organismo `LoginForm` con las moléculas
`FormField` y `PasswordField`. Conserva las reglas de acceso de la EP1: correo de hasta
100 caracteres en los dominios `duoc.cl`, `profesor.duoc.cl` o `gmail.com`, y contraseña
de 4 a 10 caracteres. Valida al salir de cada campo y al enviar, enfoca el primer campo
inválido, permite mostrar u ocultar la contraseña y evita envíos duplicados mientras
se resuelve el acceso. Los errores quedan asociados a sus campos y se anuncian los
fallos generales mediante un aviso accesible.

`AccountActions` integra el acceso a Login, el nombre, el rol y el cierre de sesión en
Navbar. Al ingresar se vuelve a la página pública de origen, conservando los filtros,
o al panel `/admin` si ese es el origen y el perfil tiene permiso. Sin un origen
válido, Cliente entra a `/productos`; Vendedor y Administrador entran a `/admin`,
como en la EP1. Se descartan destinos externos, `/login`, `/registro` y rutas
todavía no disponibles. Un origen público válido se conserva para todos los perfiles.

Cerrar sesión conserva la compra y mantiene la página pública actual. Una sesión
vigente evita volver a mostrar los formularios de Login y Registro.

## Rutas protegidas y permisos

`src/utils/permissions.js` centraliza los permisos heredados de `admin-auth.js`:

| Permiso | Cliente | Vendedor | Administrador |
| --- | --- | --- | --- |
| `ADMIN_ACCESS` | No | Sí | Sí |
| `PRODUCTS_VIEW` | No | Sí | Sí |
| `ORDERS_VIEW` | No | Sí | Sí |
| `PRODUCTS_MANAGE` | No | No | Sí |
| `USERS_MANAGE` | No | No | Sí |

Son permisos del área administrativa; el catálogo público continúa abierto a todos.
Un permiso o rol desconocido se deniega.

`ProtectedRoute` renderiza un `Outlet` únicamente con sesión y el permiso solicitado.
Sin sesión envía a Login con `replace`, conservando `pathname` y `search` en el estado
del router. Si falta el permiso, vuelve al destino inicial del rol: tienda para
Cliente y panel para perfiles de gestión. Se pueden anidar guardas para reservar
un módulo al Administrador. Sin la prop `permission` exige solo una sesión válida.
El destino de rechazo debe quedar fuera de la guarda que rechaza, como en las rutas
anidadas verificadas en sus pruebas.

`RoleGate` condiciona acciones visibles usando la misma matriz y permite un `fallback`.
Navbar ofrece «Administración» solo a Administrador y Vendedor. Ocultar acciones
complementa la protección de la ruta. Ambas reaccionan al cierre, eliminación de usuario
y cambios de rol sincronizados por AuthProvider; no se guarda una copia del permiso
al montar. El rol se obtiene del registro vigente del usuario al recuperar la sesión.

`/admin` y sus rutas desconocidas están protegidas por `ADMIN_ACCESS`. AdminLayout
reutiliza BrandLink y AccountActions, añade menú móvil, salto al contenido, un main
con Outlet y pie administrativo. AdminHomePage muestra la sesión y un resumen
calculado a partir de los mismos productos del catálogo: referencias, unidades y
productos cuyo stock es menor o igual al umbral crítico. Las rutas inexistentes
muestran 404 con regreso a tienda o panel.

El panel y el menú ofrecen Usuarios solo al Administrador y Productos también al
Vendedor. Pedidos está disponible para ambos perfiles. Los tres módulos usan sus
guardas y tarjetas AdminModuleCard, con accesos activos desde el panel.

## Consulta de pedidos

`/admin/pedidos` y `/admin/pedidos/:id` exigen `ORDERS_VIEW`, además del acceso
administrativo. Sin sesión se solicita Login y se conserva el destino; Cliente
vuelve a la tienda. Administrador y Vendedor pueden consultar lista y detalle.
Los cambios de rol o cierre de sesión sincronizados retiran también estas pantallas.

`src/data/orders.js` conserva los tres pedidos demostrativos de la EP1: identidad,
fecha, cliente, estado y líneas con nombre, precio y cantidad registrados.
`adminOrders.js` comprueba el rol vigente en cada consulta y devuelve copias de
los datos. No agrega una clave de almacenamiento ni operaciones de escritura.
Se conserva el alcance de consulta de la versión original.

`OrdersTable`, `OrderItemsTable` y `OrderSummary` reutilizan el layout, Badge,
Price y su formato CLP. `OrderStatusBadge` distingue los estados mediante texto
y color. Las tablas tienen encabezados y regiones desplazables con teclado;
el resumen se adapta al ancho móvil. Un id inválido o inexistente ofrece volver
a la lista y los subcaminos desconocidos muestran 404 bajo la misma guarda.

La cantidad total suma unidades, no referencias. Los importes se calculan a partir
de las líneas del pedido y no del catálogo editable; cambiar o eliminar un producto
actual no modifica esos datos históricos. Se muestra el total de productos, sin
añadir las reglas de despacho del carrito que la EP1 no incluye en estos pedidos.

## Gestión de productos y catálogo compartido

Las rutas `/admin/productos`, `/admin/productos/nuevo` y
`/admin/productos/:id/editar` reutilizan AdminLayout. La lista exige `PRODUCTS_VIEW`;
los formularios y las operaciones de escritura exigen `PRODUCTS_MANAGE`. Vendedor
puede consultar precios, stock y detalle público; Administrador puede crear,
editar y eliminar. Login conserva el destino solicitado si el perfil tiene permiso.

`ProductsTable` y `AdminProductForm` componen las páginas. El formulario reutiliza
FormField y Button: código único de al menos 3 caracteres, categoría del catálogo,
nombre de hasta 100 caracteres, descripción opcional de hasta 500, precio no negativo,
stock entero no negativo y umbral crítico opcional. Precio, stock y umbral aceptan 0;
un umbral vacío se guarda como `null`. Conserva contador, validación por campo, foco
en el primer error, alerta de stock y bloqueo de envíos repetidos. El diálogo de
eliminación comparte `ConfirmDeleteDialog` con Usuarios y enfoca Cancelar al abrir.

`productStore.js` conserva `kynex_products`. `useCatalog` usa una instantánea estable
con `useSyncExternalStore`, notificaciones dentro de la pestaña y eventos `storage`
entre pestañas. Inicio, catálogo, detalle, inventario y carrito consumen los mismos
productos. Si la clave no existe, se usan los seis productos iniciales sin escribir;
una lista vacía no se repuebla. Datos dañados o duplicados se anuncian y no se reemplazan.

`adminProducts.js` vuelve a consultar la sesión vigente, valida datos y códigos
duplicados y compara el producto abierto antes de guardar o eliminar. La edición
conserva id, destacados, marca, formato, sabor y metadatos adicionales de la EP1.
Un cambio detectado desde otra pestaña conserva el borrador, bloquea Guardar y ofrece
Recargar datos. Una escritura fallida conserva el catálogo anterior. El almacenamiento
local sigue siendo demostrativo y no ofrece transacciones concurrentes entre pestañas.

La imagen opcional admite URL http(s) o una ruta `/assets/`; las rutas heredadas
`../../assets/...` se normalizan. ProductImage prioriza la imagen personalizada y,
si falta, recupera una de las seis originales por código. `assetImages.js` resuelve
los recursos originales a las URL que Vite genera también en producción. Al agregar
imágenes locales nuevas hay que registrar su ruta en ese manifiesto. Si la imagen
falla o no hay una disponible se conserva el icono. El carrito toma precio y stock vigentes, limita cantidades,
retira agotados/eliminados y persiste las cantidades ajustadas. Un fallo de lectura
del catálogo conserva la compra guardada; un fallo al guardar el carrito se anuncia
y conserva los cambios en memoria durante esa visita.

## Gestión de usuarios

`AdminUsersPage` compone `UsersTable` y `DeleteUserDialog`. Muestra RUN, nombre,
correo, región, comuna, rol y acciones; la tabla se desplaza horizontalmente en
pantallas estrechas. La cuenta conectada se identifica como «Sesión actual» y
carece de acción de eliminar. El diálogo nativo enfoca Cancelar, admite Escape y
devuelve el foco al cerrarse; la eliminación requiere confirmación explícita.

`AdminUserFormPage` carga un usuario por id o abre un formulario vacío. Un id
inválido o inexistente muestra un error y un enlace de regreso. `AdminUserForm`
reutiliza `UserProfileFields` con el registro público, agrega el selector de rol
y valida los mismos límites, RUN, dominios, fecha opcional y región/comuna.
Al guardar vuelve a la lista con un aviso accesible.

`src/services/adminUsers.js` verifica la sesión vigente y `USERS_MANAGE` en cada
operación, incluso cuando se invoca fuera de las páginas:

| Función | Comportamiento |
| --- | --- |
| `listManagedUsers()` | Devuelve perfiles administrables sin contraseñas. |
| `getManagedUser(id)` | Recupera un perfil por id entero positivo. |
| `saveManagedUser(values, { id, expectedUser }?)` | Crea si no se proporciona id o edita una cuenta existente. Comprueba duplicados y cambios respecto a la versión abierta. |
| `deleteManagedUser(id, expectedUser?)` | Elimina otra cuenta; impide eliminar la cuenta conectada y detecta cambios desde su selección. |

Los resultados incluyen `success`, y en caso de fallo `message`, `code` o `errors`
por campo. Las cuentas nuevas reciben contraseña demostrativa `1234`; editar conserva
la contraseña y los datos adicionales existentes e ignora ids/contraseñas enviados
como campos del formulario. El registro público sigue creando únicamente Clientes.

`userStore.js` comparte la lectura y la generación de ids con autenticación, conservando
`kynex_users` y `kynex_session`. Un registro dañado o con ids repetidos se rechaza para
escritura. No se reponen cuentas eliminadas ni se modifica el carrito. Al editar la
cuenta conectada se actualiza también su sesión; si falla guardar usuarios, se intenta
restaurar la sesión anterior y se vuelve a comprobar el acceso. Cambiar el rol propio
puede retirar el acceso, como informa el formulario antes de guardar.

La lista escucha cambios entre pestañas. El formulario conserva el borrador si otra
pestaña cambia la cuenta, deshabilita Guardar y ofrece Recargar datos. El servicio
vuelve a comparar el perfil abierto al guardar o eliminar para evitar sobrescribir
cambios detectables. Esto sigue usando almacenamiento local, sin un servidor que
coordine transacciones entre usuarios.

## Contacto

`/contacto` es público y usa PublicLayout, con enlaces desde Navbar y Footer.
`ContactForm` reutiliza FormField y Button. Valida nombre obligatorio de hasta
100 caracteres, correo obligatorio de hasta 100 en los dominios permitidos y
comentario obligatorio de hasta 500. Comparte `getEmailError` con los otros
formularios. El contador muestra la longitud actual del comentario; los errores
se asocian a los campos, se enfoca el primero inválido y se retiran al corregir.

Se conserva la validación local de la EP1. El botón «Validar mensaje» y la nota
de demostración aclaran su alcance. El éxito muestra «Mensaje validado correctamente»
y conserva los valores; editar retira la confirmación hasta volver a validar.
No se guardan mensajes ni se realizan envíos. La página conserva sesión y carrito,
permite volver desde Login y mantiene el borrador al cerrar sesión en la misma ruta.

## Paridad del catálogo con EP1

`src/data/products.js` conserva la ficha completa de los seis productos originales.
ProductInformation compone ProductInfoList, listas de uso, tabla nutricional y calidad
y seguridad. Presenta beneficios, ingredientes, alérgenos, uso, nutrición, certificaciones
y advertencia. Tolera metadatos incompletos; cero calorías permanece visible y la falta
de información sobre alérgenos se distingue de una lista explícitamente vacía.

`completeProductDetails` completa solo campos de detalle ausentes en los catálogos
guardados por las primeras etapas React, y exige coincidencia de id y código original.
Leer no escribe: precios, stock, nombres, descripciones e imágenes guardados prevalecen.
También se conservan listas vacías, null y objetos parciales explícitos. Los datos
adicionales quedan preservados cuando se guarda una edición administrativa posterior.

El detalle reutiliza QuantitySelector para elegir de 1 a 10 unidades por adición,
limitadas además por el stock que queda después del carrito. El mensaje informa la
cantidad realmente agregada y la selección se ajusta ante cambios del catálogo. Los
productos agotados o ya completos en el carrito bloquean Agregar. La búsqueda incluye
nombre, descripción, categoría y código; las tarjetas muestran los objetivos originales.

La revisión y los pendientes concretos se registran en [docs/paridad-ep1.md](docs/paridad-ep1.md).
Quedan bloques y accesos del Inicio original y el aviso demostrativo de Continuar compra,
además de la revisión transversal y documentación final.

## Blog y artículos

Las rutas públicas `/blog`, `/blog/creatina-y-rendimiento` y
`/blog/recuperacion-muscular` reutilizan PublicLayout. `src/data/articles.js` conserva
los dos artículos de la EP1, sus resúmenes, categorías, párrafos, listas, notas
informativas y fotografías originales. El contenido se representa con JSX y texto;
no se inyecta HTML. Su alcance sigue siendo académico e informativo.

El átomo ArticleImage muestra texto alternativo, carga diferida y una alternativa
si falta o falla la imagen. BlogCard compone imagen, Badge, título, resumen y un enlace
con nombre accesible que identifica el artículo. BlogFeed agrega el encabezado de
sección y la grilla. ArticleContent comparte el cuerpo de lectura entre ambos
artículos, con encabezados, listas y nota identificable. BlogArticlePage resuelve
el slug solicitado y muestra «Artículo no encontrado» si no existe.

El enlace «Volver al blog» apunta a `/blog`, incluso al entrar o recargar directamente
un artículo. La portada ofrece acceder a la tienda. Navbar y Footer incorporan Blog;
el enlace de cabecera permanece activo durante la lectura. El menú conserva su
comportamiento móvil y ajusta el espaciado de escritorio para alojar todos los accesos.
Login conserva portada o artículo de origen, incluida la consulta. Visitar estas
páginas no agrega claves de almacenamiento; compra y rutina se conservan al navegar,
recargar e iniciar o cerrar sesión.

Las 20 pantallas del inventario original tienen ruta y contenido en React. La
auditoría transversal, el ERS y el informe de testing están documentados. Continúan
las verificaciones del entorno de presentación y el ensayo de defensa indicados
en [la auditoría final](docs/auditoria-final.md).

## Nosotros

`/nosotros` es pública y reutiliza PublicLayout. Conserva la presentación de KYNEX,
su propuesta, experiencia, categorías, visión, compromisos y accesos al catálogo de
la página original. Los textos sobre la ficha de producto resumen información disponible
en React; el detalle ahora incorpora también la información ampliada de la EP1.

`src/data/about.js` separa las listas de contenido de la presentación. El organismo
`FeatureSection` compone SectionHeading y FeatureCard mediante props; se reutiliza
en Inicio y en las tres secciones de ventajas de Nosotros. CategoryGrid y CategoryCard
enlazan las cuatro categorías con el filtro correspondiente de la tienda. Los otros
dos accesos abren el catálogo completo. El diseño usa Bootstrap y los colores KYNEX,
con columnas adaptadas a escritorio, tableta y móvil.

Navbar y Footer incorporan Nosotros y el menú móvil cierra al entrar. Login conserva
esta ruta y su consulta como destino de regreso. La página no agrega almacenamiento
ni modifica sesión, usuarios, productos, carrito o rutina al consultarla; cerrar sesión
conserva las selecciones del navegador. Los subcaminos desconocidos muestran 404.

## Entrenamiento y rutina

`/entrenamiento` y `/rutina` son públicas y reutilizan PublicLayout. Navbar y Footer
enlazan ambas páginas; Login permite regresar a cualquiera de ellas. El menú se
contrae por debajo de 1200 px para alojar los nuevos accesos y las acciones de sesión.

`src/data/exercises.js` conserva los ocho ejercicios, ids, textos, fotografías y
sugerencias de la EP1. `ExerciseLibrary` combina búsqueda por nombre/descripción,
grupo muscular y dificultad, con contador y estado vacío. `ExerciseCard` recibe
sus datos y callback por props, usa un icono si falla la imagen y bloquea ejercicios
ya seleccionados. Las confirmaciones se muestran en la página, sin alertas nativas.

`routineStore.js` conserva `kynex_routine` y el formato `{ id, sets, reps }`;
`useRoutine` comparte una instantánea con useSyncExternalStore y escucha cambios
locales y entre pestañas. La rutina pertenece a este navegador, como en la EP1;
iniciar o cerrar sesión no modifica su contenido. No agrega un proveedor al carrito.

`RoutineBuilder` compone resumen, `RoutineItem`, estado vacío y ConfirmDeleteDialog.
Series y repeticiones reutilizan FormField y se guardan al salir del campo o pulsar
Enter. Se exigen enteros de 1–20 series y 1–100 repeticiones, respetando los límites
declarados en el HTML original; los valores inválidos muestran un error sin guardarse.
Se pueden quitar ejercicios y vaciar la rutina tras confirmar; Cancelar o Escape
conservan la selección. El resumen calcula ejercicios distintos y series totales.

La lectura conserva ajustes heredados válidos, convierte cantidades numéricas de
texto, aplica sugerencias a cantidades ausentes/inválidas y ajusta excesos a los
límites. Omite referencias de ejercicios inexistentes, como la versión original.
Leer no escribe. JSON dañado, registros mal formados o ids repetidos bloquean las
escrituras sin reemplazar los datos. Un fallo de persistencia conserva la rutina
anterior y ofrece volver a intentar. Cada operación vuelve a leer los datos vigentes;
LocalStorage sigue sin ofrecer transacciones entre pestañas.

## Registro de clientes

`RegistrationPage` usa PublicLayout y el organismo `RegistrationForm`. Reutiliza
`FormField`, que admite input, select y textarea con etiquetas, ayuda y errores
asociados. Conserva el catálogo de regiones y comunas de la EP1.

Valida RUN de 7 a 9 caracteres con módulo 11 (normaliza puntos, guion y K), nombre
obligatorio de hasta 50 caracteres, apellidos hasta 100, correo permitido hasta 100,
región y comuna relacionadas y dirección obligatoria hasta 300. La fecha de nacimiento
es opcional y, si se informa, debe existir en el calendario. Al cambiar la región,
se reinicia la comuna. Los errores se validan al salir del campo y al enviar, enfocando
el primer campo inválido; el envío permanece deshabilitado mientras se procesa.

El servicio vuelve a leer los usuarios y comprueba duplicados de RUN y correo antes
de guardar. Preserva los registros previos y rechaza almacenamiento dañado sin
sobrescribirlo. Genera un id único y fija el rol Cliente y la contraseña demostrativa
`1234`, como en la EP1, aunque el consumidor intente enviar otro rol o contraseña.
El éxito reinicia el formulario y ofrece iniciar sesión. La página de origen se
conserva entre Login y Registro para volver a ella después de ingresar.

## Desarrollo y verificación

Requiere Node.js 22.12 o superior.

```sh
npm ci
npm run dev
npm test
npm run test:coverage
npm run build
```

No es necesario ejecutar toda la suite por cada edición. Para comprobar únicamente
Inicio y el aviso del carrito (5 archivos y 30 pruebas en este corte):

```sh
npm test -- HomePage FeatureSection HomeParity CartSummary CartPage
```

En PowerShell se puede usar `npm.cmd` en lugar de `npm`. Los filtros seleccionan
la composición de Inicio, enlaces, video, acceso público, persistencia y aviso de compra.
Catálogo y detalle conservan su selección rápida:
`npm test -- productDetails ProductInformation ProductImage ProductDetailPage ProductsPage QuantitySelector CatalogParity`.
Blog conserva su selección rápida: `npm test -- ArticleImage BlogCard ArticleContent BlogPage Blog.test`.
Nosotros conserva su selección rápida: `npm test -- About.test AboutPage FeatureSection HomePage`.
Entrenamiento y rutina conservan su selección rápida:
`npm test -- ExerciseCard ExerciseLibrary RoutineItem routine.test routineStore Training.test`.
Contacto conserva su selección rápida: `npm test -- ContactForm contact.test Contact.test`.

| Momento | Comprobación |
| --- | --- |
| Durante la edición de un módulo | Pruebas de los archivos afectados. |
| Al cerrar una etapa, especialmente con cambios en rutas, proveedores o componentes compartidos | Una ejecución de la suite completa para detectar regresiones. |
| Antes de la entrega final o al actualizar su evidencia de testing | Suite con cobertura y build de producción. |

Después de descargar una etapa que ya pasó la regresión completa, la comprobación
del módulo sirve como revisión rápida en el equipo del estudiante. Repetir la
suite completa tiene sentido si aparecen fallos locales, conflictos de integración
o cambios adicionales. La cobertura se mide para documentar un corte; no hace falta
repetirla con cada cambio pequeño.

Las pruebas usan Vitest y React Testing Library. Cubren los componentes, las rutas
con el layout compartido, el menú móvil y la actualización del contador al agregar,
cambiar cantidades, eliminar y vaciar productos, además de recuperar el carrito guardado.
También verifican autenticación, persistencia y sincronización de sesiones, consultas
de roles, compatibilidad con los datos de la EP1 y errores de almacenamiento.
El registro agrega pruebas de validaciones, duplicados, selectores relacionados,
persistencia, errores de escritura y el recorrido Registro > Login > Carrito.
La gestión administrativa verifica creación, edición, eliminación/cancelación,
duplicados, protección de la cuenta conectada, sincronización del perfil propio,
conflictos entre pestañas, datos dañados, fallos de persistencia y reversión de sesión.
Los productos agregan validaciones, permisos de escritura, duplicados de código,
conservación de metadatos e integración con categoría, detalle, inicio, inventario y
carrito; se prueban cambios de precio, límites de stock, errores y recuperación.
Los pedidos verifican cálculos, consulta sin escrituras, datos históricos, copias
independientes, permisos vigentes, acceso directo y posterior a Login, recarga,
ids inexistentes, denegación del servicio y retirada de datos al perder el acceso.
También se comprueban los accesos del panel según el perfil y el cierre del menú.
Contacto verifica obligatoriedad, límites, dominios, contador, foco y corrección de
errores, confirmación local, acceso público, navegación, retorno desde Login y
conservación del carrito y la sesión sin enviar peticiones. Entrenamiento y rutina
comprueban filtros combinados, duplicados, valores heredados, límites numéricos,
recarga, sincronización, cancelación/confirmación, fallos de almacenamiento y
conservación de los datos de sesión, catálogo y compra. Nosotros comprueba contenido
institucional, composición por props, enlaces a categorías y catálogo, acceso público,
menú móvil, retorno desde Login, recarga y conservación de compra y rutina.
Blog y artículos agregan composición por props, alternativa de imagen, contenido
original, enlaces distinguibles, lectura directa, cambio de artículo, acceso con
todos los perfiles, retorno desde Login, recarga y manejo de artículos inexistentes.
La paridad de catálogo añade comparación de datos originales, lectura compatible sin
escrituras, personalizaciones, nutrición con valores cero, alérgenos, tipos inesperados,
imágenes originales y rutas antiguas, cantidades elegidas y stock restante.
Inicio agrega navegación hacia todos sus nuevos destinos, objetivos sin filtros
inventados, recarga con los tres perfiles y visita anónima, catálogo vacío o dañado
y conservación de la compra y la rutina. El aviso de checkout verifica teclado,
foco, descripción accesible y ausencia de solicitudes o escrituras.
Las pruebas de acceso cubren los tres perfiles, visita anónima, historial sin ciclos,
no montaje de contenido privado, permisos desconocidos, cambios de rol, eliminación
de usuarios, cierre entre pestañas, Login al panel y conservación del carrito.

Vitest ejecuta como máximo dos archivos simultáneamente, cada uno con su propio
entorno jsdom, para reducir la competencia por CPU y memoria. Se conserva el límite
de 5 segundos por prueba. El auxiliar que completa los datos de registro usa
`userEvent.click` y `userEvent.paste`; los casos de validación y corrección mantienen
la escritura tecla a tecla. Así los recorridos completos siguen comprobando eventos,
normalización, persistencia y navegación sin repetir esa escritura en cada campo.

El avance estimado frente a la pauta, las funcionalidades pendientes y la medición
de cobertura de esta etapa se documentan en [docs/avance-migracion.md](docs/avance-migracion.md).
