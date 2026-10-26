# Retiro del código anterior a React

Fecha: 26 de octubre de 2026. Rama: `feature/react-migration`.

Se eliminaron **51 archivos** sin participación en la aplicación vigente: 19 HTML,
7 hojas CSS y 25 módulos JavaScript. Sus responsabilidades ya están implementadas
en React. El retiro evita mantener dos versiones de las pantallas y reglas de negocio.

Se conserva `index.html` como entrada de Vite y las 19 imágenes de `assets/img/`,
utilizadas por React. La página de inicio anterior ya había sido sustituida por
HomePage antes de esta depuración; no se incluye en los 19 HTML retirados.

## Sustitución de pantallas

| Archivo retirado | Reemplazo vigente |
| --- | --- |
| `admin/index.html` | AdminHomePage; /admin |
| `admin/orders/order-detail.html` | AdminOrderDetailPage; /admin/pedidos/:id |
| `admin/orders/orders.html` | AdminOrdersPage; /admin/pedidos |
| `admin/products/product-form.html` | AdminProductFormPage; /admin/productos/nuevo y /admin/productos/:id/editar |
| `admin/products/products.html` | AdminProductsPage; /admin/productos |
| `admin/users/user-form.html` | AdminUserFormPage; /admin/usuarios/nuevo y /admin/usuarios/:id/editar |
| `admin/users/users.html` | AdminUsersPage; /admin/usuarios |
| `pages/account/login.html` | LoginPage; /login |
| `pages/account/register.html` | RegistrationPage; /registro |
| `pages/information/about.html` | AboutPage; /nosotros |
| `pages/information/blog-detail-1.html` | BlogArticlePage; /blog/creatina-y-rendimiento |
| `pages/information/blog-detail-2.html` | BlogArticlePage; /blog/recuperacion-muscular |
| `pages/information/blog.html` | BlogPage; /blog |
| `pages/information/contact.html` | ContactPage; /contacto |
| `pages/shop/cart.html` | CartPage; /carrito |
| `pages/shop/product-detail.html` | ProductDetailPage; /productos/:id |
| `pages/shop/products.html` | ProductsPage; /productos |
| `pages/training/routine.html` | RoutinePage; /rutina |
| `pages/training/training.html` | TrainingPage; /entrenamiento |

## Sustitución de estilos

| Archivo retirado | Reemplazo vigente |
| --- | --- |
| `assets/css/admin.css` | src/styles/admin.css y AdminLayout |
| `assets/css/components.css` | Estilos de componentes de src/styles y Bootstrap |
| `assets/css/content.css` | src/styles/about.css, blog.css y contact.css |
| `assets/css/forms.css` | src/styles/auth.css, admin.css y contact.css; formularios reutilizables |
| `assets/css/main.css` | src/styles/global.css, layout.css y home.css |
| `assets/css/shop.css` | src/styles/shop.css |
| `assets/css/training.css` | src/styles/training.css |

## Sustitución de módulos JavaScript

| Archivo retirado | Reemplazo vigente |
| --- | --- |
| `assets/js/app.js` | App, AppRouter, HomePage, Navbar y Footer |
| `assets/js/data/exercises.js` | src/data/exercises.js |
| `assets/js/data/orders.js` | src/data/orders.js |
| `assets/js/data/products.js` | src/data/products.js |
| `assets/js/data/regions.js` | src/data/regions.js |
| `assets/js/data/users.js` | src/data/users.js |
| `assets/js/modules/admin-auth.js` | AuthContext, ProtectedRoute y permisos centralizados |
| `assets/js/modules/admin-order-detail.js` | AdminOrderDetailPage, OrderSummary y OrderItemsTable |
| `assets/js/modules/admin-orders.js` | AdminOrdersPage, OrdersTable y servicio adminOrders |
| `assets/js/modules/admin-product-form.js` | AdminProductForm, servicio adminProducts y validación de productos |
| `assets/js/modules/admin-products.js` | AdminProductsPage, ProductsTable y servicio adminProducts |
| `assets/js/modules/admin-user-form.js` | AdminUserForm, servicio adminUsers y validación de usuarios |
| `assets/js/modules/admin-users.js` | AdminUsersPage, UsersTable y servicio adminUsers |
| `assets/js/modules/auth.js` | AuthContext y servicios auth y userStore |
| `assets/js/modules/cart.js` | CartContext, CartPage y utilidades de carrito |
| `assets/js/modules/contact.js` | ContactForm, ContactPage y validación de contacto |
| `assets/js/modules/image-config.js` | ProductImage, productImages y assetImages |
| `assets/js/modules/login.js` | LoginPage, LoginForm y servicio auth |
| `assets/js/modules/product-detail.js` | ProductDetailPage, ProductInformation y utilidades productDetails |
| `assets/js/modules/product-renderer.js` | ProductGrid, ProductCard y ProductImage |
| `assets/js/modules/product-storage.js` | Servicio productStore y hook useCatalog |
| `assets/js/modules/register.js` | RegistrationPage, RegistrationForm y registro de usuarios |
| `assets/js/modules/routine.js` | RoutineBuilder, hook useRoutine y servicio routineStore |
| `assets/js/modules/training.js` | TrainingPage, ExerciseLibrary y ExerciseCard |
| `assets/js/modules/validation.js` | Utilidades validation, registration, products y adminUsers |

## Conservación de la prueba de paridad

La prueba del catálogo importaba el módulo original de productos. Antes de retirarlo,
sus seis registros completos se congelaron como datos JSON exclusivos de testing.
La comparación conserva todos los campos y utiliza una referencia independiente
del catálogo de producción. El dato histórico no se regenera a partir del catálogo vigente.
Las correcciones futuras del catálogo deben revisar explícitamente esa expectativa.

## Validación

- 80 archivos de prueba; 597 casos aprobados, 0 fallidos y 0 omitidos.
- Cobertura: sentencias 97,91%; ramas 94,74%; funciones 99,30%; líneas 98,98%.
- Build de producción correcto. Sus 24 archivos coinciden byte a byte con la compilación anterior.
- Los componentes, estilos y datos de ejecución, la entrada HTML y las 19 imágenes conservan su contenido.
- No quedan dependencias de ejecución ni pruebas que importen las carpetas retiradas.
- La revisión visual anterior corresponde al mismo resultado compilado; no se presenta como una nueva revisión de navegador.

El corte anterior `a7df48b` conserva el material histórico en Git.
El retiro se registra en `024096d`. El cambio no modifica `main` ni altera las
limitaciones funcionales y de aceptación previamente documentadas.

El inventario y las huellas se conservan en [limpieza-legacy.json](evidencias/limpieza-legacy.json).
La nueva ejecución se registra en [testing-limpieza.json](evidencias/testing-limpieza.json)
y [coverage-limpieza.json](evidencias/coverage-limpieza.json).
