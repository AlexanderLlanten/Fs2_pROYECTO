# Guía de defensa de KYNEX

La presentación individual pesa 60% de la EP2. Esta guía prepara la explicación; el ensayo y la exposición deben realizarlos el estudiante. Vitest fue autorizado por el docente según confirmación del estudiante.

## Recorrido sugerido

1. Explicar la migración de 20 pantallas HTML a React y el alcance Front End. Mostrar AppRouter, PublicLayout y AdminLayout.
2. Mostrar Atomic Design: StockBadge → ProductCard → ProductGrid → página. Explicar props, callbacks, estado local y Context.
3. Agregar un producto, revisar contador de unidades y despacho, recargar y comprobar persistencia.
4. Mostrar un formulario con errores y región/comuna; explicar validación de interfaz y servicio.
5. Comparar acceso anónimo, Cliente, Vendedor y Administrador. Las guardas controlan la demostración del cliente; la seguridad real necesitará servidor.
6. Explicar y ejecutar las diez pruebas siguientes. Mostrar una aserción y el defecto que detectaría cada caso.
7. Abrir el informe de cobertura y explicar ramas, líneas, mocks y exclusiones. Cerrar con los límites reales del prototipo.

## Diez pruebas representativas

Los filtros `-t` seleccionan por nombre. Ejecutarlos individualmente ayuda a explicar; no es necesario lanzar las 597 pruebas en cada demostración.

### 1. Props de producto

Archivo: [src/components/molecules/ProductCard.test.jsx](../src/components/molecules/ProductCard.test.jsx).

Caso: **renderiza los datos principales recibidos mediante la prop product**.

Se entrega un producto por props y se comprueban nombre, categoría y precio en el DOM. Detecta pérdida o presentación incorrecta de datos. No necesita un mock.

```powershell
npm.cmd test -- src/components/molecules/ProductCard.test.jsx -t 'renderiza los datos principales recibidos mediante la prop product'
```

### 2. Callback de agregar

Archivo: [src/components/molecules/ProductCard.test.jsx](../src/components/molecules/ProductCard.test.jsx).

Caso: **entrega el producto al callback cuando se presiona Agregar**.

userEvent pulsa Agregar y un vi.fn comprueba que recibe el objeto product. Detecta un evento desconectado o un argumento incorrecto; la persistencia se verifica en otros casos del carrito.

```powershell
npm.cmd test -- src/components/molecules/ProductCard.test.jsx -t 'entrega el producto al callback cuando se presiona Agregar'
```

### 3. Producto agotado

Archivo: [src/components/atoms/StockBadge.test.jsx](../src/components/atoms/StockBadge.test.jsx).

Caso: **muestra Sin stock cuando no quedan unidades**.

Se renderiza stock 0 con nivel crítico 5 y se espera Sin stock. Comprueba la precedencia del agotamiento frente al estado crítico.

```powershell
npm.cmd test -- src/components/atoms/StockBadge.test.jsx -t 'muestra Sin stock cuando no quedan unidades'
```

### 4. Controles bloqueados

Archivo: [src/components/molecules/QuantitySelector.test.jsx](../src/components/molecules/QuantitySelector.test.jsx).

Caso: **permite bloquear ambos límites sin ejecutar los callbacks**.

Con ambos límites deshabilitados se intenta aumentar y disminuir. Dos mocks verifican que ningún callback se ejecuta. La regla numérica de stock se prueba además en cart.test.js.

```powershell
npm.cmd test -- src/components/molecules/QuantitySelector.test.jsx -t 'permite bloquear ambos límites sin ejecutar los callbacks'
```

### 5. Despacho gratuito

Archivo: [src/utils/cart.test.js](../src/utils/cart.test.js).

Caso: **calcula despacho gratuito desde $50.000**.

Dos unidades de $39.990 producen despacho $0 y total $79.980. Es una prueba de función pura; este caso comprueba un subtotal sobre el umbral, no una medición de rendimiento ni el valor límite exacto.

```powershell
npm.cmd test -- src/utils/cart.test.js -t 'calcula despacho gratuito'
```

### 6. Búsqueda del catálogo

Archivo: [src/pages/ProductsPage.test.jsx](../src/pages/ProductsPage.test.jsx).

Caso: **filtra el catálogo al escribir en el buscador**.

Se escribe en el buscador y se comprueba la presencia del producto coincidente y la ausencia de otros productos. Detecta filtros que no actualizan el DOM.

```powershell
npm.cmd test -- src/pages/ProductsPage.test.jsx -t 'filtra el catálogo al escribir en el buscador'
```

### 7. Estado del menú móvil

Archivo: [src/components/organisms/Navbar.test.jsx](../src/components/organisms/Navbar.test.jsx).

Caso: **abre y cierra el menú móvil y lo cierra al navegar**.

Los clics alternan aria-expanded y la clase show; al ir a Tienda el menú se cierra y el enlace queda activo. jsdom verifica estado y atributos; la apariencia se revisa en navegador.

```powershell
npm.cmd test -- src/components/organisms/Navbar.test.jsx -t 'abre y cierra el menú móvil y lo cierra al navegar'
```

### 8. Región y comuna

Archivo: [src/components/organisms/RegistrationForm.test.jsx](../src/components/organisms/RegistrationForm.test.jsx).

Caso: **habilita comunas de la región y reinicia la selección al cambiarla**.

La comuna inicia deshabilitada. Tras elegir Santiago y cambiar a Valparaíso se vacía el valor, desaparece Santiago y aparece Viña del Mar. Evita conservar una comuna incompatible.

```powershell
npm.cmd test -- src/components/organisms/RegistrationForm.test.jsx -t 'habilita comunas de la región y reinicia la selección al cambiarla'
```

### 9. Guarda de acceso

Archivo: [src/routes/ProtectedRoute.test.jsx](../src/routes/ProtectedRoute.test.jsx).

Caso: **no monta contenido privado para un visitante y conserva ruta y filtros para Login**.

Sin sesión se muestra Login, se preservan pathname y search y no aparece el contenido privado. Un mock de montaje confirma que el componente protegido no se montó.

```powershell
npm.cmd test -- src/routes/ProtectedRoute.test.jsx -t 'no monta contenido privado para un visitante y conserva ruta y filtros para Login'
```

### 10. Recuperación de almacenamiento

Archivo: [src/services/adminUsers.test.js](../src/services/adminUsers.test.js).

Caso: **revierte la sesión si falla guardar el perfil propio**.

Un spy de Storage.prototype.setItem lanza una DOMException al escribir usuarios. Se espera código STORAGE, usuarios originales y sesión anterior. Detecta un perfil o una sesión parcialmente actualizados.

```powershell
npm.cmd test -- src/services/adminUsers.test.js -t 'revierte la sesión si falla guardar el perfil propio'
```

## Preguntas para ensayar

- **¿Por qué React?** Componentes declarativos, composición y estado; el DOM se actualiza a partir de datos. React Router comparte layouts y resuelve rutas.
- **¿Props o estado?** Props son entradas del padre; estado representa cambios de la interacción. Context comparte carrito y sesión cuando varios componentes los consumen.
- **¿Qué aporta Bootstrap?** Grilla, utilidades y clases responsivas; el CSS propio conserva la estética KYNEX. Mostrar 390, 768 y 1280 px.
- **¿Qué es un mock?** Un doble controlado para observar un contrato o provocar un fallo. Mostrar vi.fn en ProductCard y un spy de Storage en adminUsers.
- **¿597 unitarias?** La suite combina unitarias y pruebas de integración. Explicar cuáles montan proveedores y rutas.
- **¿98,98% implica terminado?** Es cobertura de líneas instrumentadas. No mide CSS, video externo, rendimiento, compatibilidad entre navegadores ni calidad de la presentación.
- **¿La compra es real?** No. Continuar compra informa una etapa futura; no crea pedidos ni cobra. Contacto también valida de forma local.
- **¿Por qué no se reinicia todo al salir?** Carrito y rutina pertenecen al navegador como en EP1; cerrar sesión elimina la sesión y conserva esos datos.

## Preparación antes de presentar

- Abrir la rama feature/react-migration y verificar instalación/build en el equipo de la presentación. Usar un perfil de prueba y conservar el mismo origen para LocalStorage.
- Verificar reproducción de YouTube en ese navegador; durante la auditoría mostró restricción y código 151. No anunciar la reproducción como comprobada.
- Ensayar roles con las cuentas demostrativas del README y datos de prueba. No utilizar datos personales reales.
- Abrir el ERS V2, el informe Word y coverage/index.html; el HTML se genera con npm.cmd run test:coverage.
- Practicar la explicación de preparación, acción y aserciones, sin memorizar solo nombres o porcentajes. Ajustar el tiempo a lo que indique el docente.
- El ZIP incluye fuentes y documentos; no incluye node_modules, dist ni coverage, que se regeneran. La entrega al aula virtual la realiza el estudiante.
