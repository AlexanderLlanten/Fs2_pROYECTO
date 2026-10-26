import {
    BrowserRouter,
    Route,
    Routes
} from "react-router-dom";

import CartPage from "../pages/CartPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import PublicLayout from "../components/templates/PublicLayout.jsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="productos" element={<ProductsPage />} />
                    <Route path="productos/:id" element={<ProductDetailPage />} />
                    <Route path="carrito" element={<CartPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
