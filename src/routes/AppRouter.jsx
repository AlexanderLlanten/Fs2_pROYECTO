import {
    BrowserRouter,
    Route,
    Routes
} from "react-router-dom";

import CartPage from "../pages/CartPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import RegistrationPage from "../pages/RegistrationPage.jsx";
import PublicLayout from "../components/templates/PublicLayout.jsx";
import AdminLayout from "../components/templates/AdminLayout.jsx";
import AdminHomePage from "../pages/AdminHomePage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { PERMISSIONS } from "../utils/permissions.js";
import NotFoundPage from "../pages/NotFoundPage.jsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="productos" element={<ProductsPage />} />
                    <Route path="productos/:id" element={<ProductDetailPage />} />
                    <Route path="carrito" element={<CartPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="registro" element={<RegistrationPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route element={<ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS} />}>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<AdminHomePage />} />
                        <Route path="*" element={<NotFoundPage admin />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
