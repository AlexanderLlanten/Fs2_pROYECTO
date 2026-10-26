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
Las rutas disponibles son `/`, `/productos`, `/productos/:id` y `/carrito`.
La navegación compartida enlaza estas rutas ya migradas.

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
