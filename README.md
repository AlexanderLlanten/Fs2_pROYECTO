# Fs2_pROYECTO

Frontend KYNEX en migración a React, Vite y React Router.

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

## Inicio KYNEX

HomePage recupera el encabezado «Entrena mejor. Supérate.» y la imagen original
de la marca. Compone HomeHero, CategoryGrid y FeaturedProducts con las moléculas
SectionHeading, CategoryCard y FeatureCard. Los destacados se obtienen del campo
`featured` de los mismos productos usados en el catálogo y se agregan al carrito
compartido, respetando el stock y mostrando una confirmación accesible.

Las categorías abren `/productos?categoria=...`. El selector del catálogo se
sincroniza con ese parámetro y con el historial del navegador; una categoría
desconocida muestra el catálogo completo. El aviso de despacho usa
`FREE_SHIPPING_FROM`, la misma regla que calcula el total del carrito.

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

Esta etapa entrega la base del panel. Las listas y formularios administrativos
todavía no tienen rutas React; se conectarán a sus permisos al migrar cada módulo.
La matriz y las guardas anidadas de esos permisos ya están verificadas mediante
pruebas, sin presentar esos módulos como implementados.

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

Las pruebas usan Vitest y React Testing Library. Cubren los componentes, las rutas
con el layout compartido, el menú móvil y la actualización del contador al agregar,
cambiar cantidades, eliminar y vaciar productos, además de recuperar el carrito guardado.
También verifican autenticación, persistencia y sincronización de sesiones, consultas
de roles, compatibilidad con los datos de la EP1 y errores de almacenamiento.
El registro agrega pruebas de validaciones, duplicados, selectores relacionados,
persistencia, errores de escritura y el recorrido Registro > Login > Carrito.
Las pruebas de acceso cubren los tres perfiles, visita anónima, historial sin ciclos,
no montaje de contenido privado, permisos desconocidos, cambios de rol, eliminación
de usuarios, cierre entre pestañas, Login al panel y conservación del carrito.

El avance estimado frente a la pauta, las funcionalidades pendientes y la medición
de cobertura de esta etapa se documentan en [docs/avance-migracion.md](docs/avance-migracion.md).
