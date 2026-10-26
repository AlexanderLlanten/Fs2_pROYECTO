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
import AdminUsersPage from "../pages/AdminUsersPage.jsx";
import AdminUserFormPage from "../pages/AdminUserFormPage.jsx";
import AdminProductsPage from "../pages/AdminProductsPage.jsx";
import AdminProductFormPage from "../pages/AdminProductFormPage.jsx";
import AdminOrdersPage from "../pages/AdminOrdersPage.jsx";
import AdminOrderDetailPage from "../pages/AdminOrderDetailPage.jsx";

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
                        <Route element={<ProtectedRoute permission={PERMISSIONS.USERS_MANAGE} />}>
                            <Route path="usuarios" element={<AdminUsersPage />} />
                            <Route path="usuarios/nuevo" element={<AdminUserFormPage />} />
                            <Route path="usuarios/:id/editar" element={<AdminUserFormPage />} />
                            <Route path="usuarios/*" element={<NotFoundPage admin />} />
                        </Route>
                        <Route element={<ProtectedRoute permission={PERMISSIONS.PRODUCTS_VIEW} />}>
                            <Route path="productos" element={<AdminProductsPage />} />
                            <Route element={<ProtectedRoute permission={PERMISSIONS.PRODUCTS_MANAGE} />}>
                                <Route path="productos/nuevo" element={<AdminProductFormPage />} />
                                <Route path="productos/:id/editar" element={<AdminProductFormPage />} />
                            </Route>
                            <Route path="productos/*" element={<NotFoundPage admin />} />
                        </Route>
                        <Route element={<ProtectedRoute permission={PERMISSIONS.ORDERS_VIEW} />}>
                            <Route path="pedidos" element={<AdminOrdersPage />} />
                            <Route path="pedidos/:id" element={<AdminOrderDetailPage />} />
                            <Route path="pedidos/*" element={<NotFoundPage admin />} />
                        </Route>
                        <Route path="*" element={<NotFoundPage admin />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
