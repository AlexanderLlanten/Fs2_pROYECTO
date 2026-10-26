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
Las rutas disponibles son `/`, `/productos`, `/productos/:id`, `/carrito` y `/login`.
La navegación compartida enlaza estas rutas ya migradas.

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
| `logout()` | Elimina la sesión; conserva usuarios y carrito. Devuelve un resultado con `success`. |
| `hasRole(...roles)` | Consulta uno o varios roles, por ejemplo `hasRole("Administrador", "Vendedor")`. |
| `refreshSession()` | Relee una sesión modificada por otro consumidor de la misma pestaña. |

La sesión se recupera al montar el proveedor y se sincroniza entre pestañas mediante
el evento `storage`. Si cambian los usuarios, se actualizan los datos y el rol desde
su registro; una sesión de un usuario eliminado se descarta. Las lecturas de sesión
no inicializan ni sobrescriben usuarios. Los fallos al guardar o eliminar una sesión
devuelven un error y conservan el estado anterior.

El servicio mantiene las claves de la EP1: `kynex_users` y `kynex_session`.
Las cuentas de demostración se inicializan al intentar ingresar, únicamente si
todavía no existe `kynex_users`. Un registro vacío o dañado no se reemplaza por las
cuentas iniciales. La sesión guarda solo identidad y rol, sin contraseña, RUN ni dirección.

| Rol | Correo demostrativo | Contraseña |
| --- | --- | --- |
| Cliente | camila@gmail.com | 1234 |
| Vendedor | martin@duoc.cl | 1234 |
| Administrador | admin@profesor.duoc.cl | 1234 |

Login consume este estado; Registro y las rutas protegidas se integrarán en sus etapas.
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
o a `/productos` si no existe un origen válido. Se descartan destinos externos, `/login`
y rutas todavía no disponibles. Los tres perfiles conservan su rol y usan estas rutas
públicas durante esta etapa; el destino administrativo se conectará al migrar administración.

Cerrar sesión conserva la compra y mantiene la página pública actual. Una sesión
vigente evita volver a mostrar el formulario de Login. El registro se incorporará
en la siguiente etapa.

## Desarrollo y verificación

Requiere Node.js 22.12 o superior.

```sh
npm ci
npm run dev
npm test
npm run build
```

Las pruebas usan Vitest y React Testing Library. Cubren los componentes, las rutas
con el layout compartido, el menú móvil y la actualización del contador al agregar,
cambiar cantidades, eliminar y vaciar productos, además de recuperar el carrito guardado.
También verifican autenticación, persistencia y sincronización de sesiones, consultas
de roles, compatibilidad con los datos de la EP1 y errores de almacenamiento.
