import CartProvider from "./context/CartContext.jsx";
import AppRouter from "./routes/AppRouter.jsx";

function App() {
    return (
        <CartProvider>
            <AppRouter />
        </CartProvider>
    );
}

export default App;
