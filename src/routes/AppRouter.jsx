/*
 * Navegación y acceso.
 * Declara destinos públicos y administrativos, relaciona rutas con páginas y organiza layouts y
 * guardas anidadas.
 */

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
import ContactPage from "../pages/ContactPage.jsx";
import TrainingPage from "../pages/TrainingPage.jsx";
import RoutinePage from "../pages/RoutinePage.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import BlogPage from "../pages/BlogPage.jsx";
import BlogArticlePage from "../pages/BlogArticlePage.jsx";
import ApiAdminUsersPage from "../pages/ApiAdminUsersPage.jsx";
import ApiAdminUserFormPage from "../pages/ApiAdminUserFormPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import AdminCategoriesPage from "../pages/AdminCategoriesPage.jsx";
import AdminCategoryFormPage from "../pages/AdminCategoryFormPage.jsx";
import ApiTrainingPage from "../pages/ApiTrainingPage.jsx";
import ApiRoutinePage from "../pages/ApiRoutinePage.jsx";
import AdminExercisesPage from "../pages/AdminExercisesPage.jsx";
import AdminExerciseFormPage from "../pages/AdminExerciseFormPage.jsx";
import AdminContactPage from "../pages/AdminContactPage.jsx";
import AdminContactDetailPage from "../pages/AdminContactDetailPage.jsx";
import { usesApi } from "../config/dataSource.js";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import MyOrdersPage from "../pages/MyOrdersPage.jsx";
import MyOrderDetailPage from "../pages/MyOrderDetailPage.jsx";

// Las rutas hijas comparten su layout. Las guardas administrativas se evalúan antes de mostrar el
// contenido protegido; :id y :slug son segmentos variables.
function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="productos" element={<ProductsPage />} />
                    <Route path="productos/:id" element={<ProductDetailPage />} />
                    <Route path="carrito" element={<CartPage />} />
                    {usesApi && <Route element={<ProtectedRoute />}>
                        <Route path="rutina" element={<ApiRoutinePage />} />
                        <Route path="perfil" element={<ProfilePage />} />
                        <Route path="compra" element={<CheckoutPage />} />
                        <Route path="compras" element={<MyOrdersPage />} />
                        <Route path="compras/:id" element={<MyOrderDetailPage />} />
                    </Route>}
                    <Route path="login" element={<LoginPage />} />
                    <Route path="registro" element={<RegistrationPage />} />
                    <Route path="contacto" element={<ContactPage />} />
                    <Route path="entrenamiento" element={usesApi?<ApiTrainingPage/>:<TrainingPage />} />
                    {!usesApi&&<Route path="rutina" element={<RoutinePage />} />}
                    <Route path="nosotros" element={<AboutPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:slug" element={<BlogArticlePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route element={<ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS} />}>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<AdminHomePage />} />
                        {usesApi && <Route element={<ProtectedRoute permission={PERMISSIONS.CONTACT_MANAGE} />}>
                            <Route path="contacto" element={<AdminContactPage />} />
                            <Route path="contacto/:id" element={<AdminContactDetailPage />} />
                            <Route path="contacto/*" element={<NotFoundPage admin />} />
                        </Route>}
                        {usesApi&&<Route element={<ProtectedRoute permission={PERMISSIONS.EXERCISES_MANAGE}/>}>
                            <Route path="ejercicios" element={<AdminExercisesPage/>}/>
                            <Route path="ejercicios/nuevo" element={<AdminExerciseFormPage/>}/>
                            <Route path="ejercicios/:id/editar" element={<AdminExerciseFormPage/>}/>
                            <Route path="ejercicios/*" element={<NotFoundPage admin/>}/>
                        </Route>}
                        {usesApi && <Route element={<ProtectedRoute permission={PERMISSIONS.CATEGORIES_MANAGE} />}>
                            <Route path="categorias" element={<AdminCategoriesPage />} />
                            <Route path="categorias/nuevo" element={<AdminCategoryFormPage />} />
                            <Route path="categorias/:id/editar" element={<AdminCategoryFormPage />} />
                            <Route path="categorias/*" element={<NotFoundPage admin />} />
                        </Route>}
                        <Route element={<ProtectedRoute permission={PERMISSIONS.USERS_MANAGE} />}>
                            <Route path="usuarios" element={usesApi ? <ApiAdminUsersPage /> : <AdminUsersPage />} />
                            <Route path="usuarios/nuevo" element={usesApi ? <ApiAdminUserFormPage /> : <AdminUserFormPage />} />
                            <Route path="usuarios/:id/editar" element={usesApi ? <ApiAdminUserFormPage /> : <AdminUserFormPage />} />
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
