/*
 * Entrada y configuración.
 * Coloca AuthProvider y CartProvider por encima del router. Todos los descendientes pueden consumir
 * sesión y compra sin duplicarlas en cada página.
 */

import AuthProvider from "./context/AuthContext.jsx";
import CartProvider from "./context/CartContext.jsx";
import AppRouter from "./routes/AppRouter.jsx";
import CatalogSync from "./context/CatalogSync.jsx";

// Los proveedores permanecen montados al cambiar de ruta: sesión y carrito se comparten entre todas
// las páginas descendientes.
function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <CatalogSync />
                <AppRouter />
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
