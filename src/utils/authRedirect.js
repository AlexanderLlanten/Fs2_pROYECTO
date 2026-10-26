import { matchPath } from "react-router-dom";
import { getRoleHome, hasPermission, PERMISSIONS } from "./permissions.js";

const publicPaths = ["/", "/productos", "/productos/:id", "/carrito", "/contacto", "/entrenamiento", "/rutina", "/nosotros", "/blog", "/blog/:slug"];
const userPaths = ["/admin/usuarios", "/admin/usuarios/nuevo", "/admin/usuarios/:id/editar"];
const productEditPaths = ["/admin/productos/nuevo", "/admin/productos/:id/editar"];
const orderPaths = ["/admin/pedidos", "/admin/pedidos/:id"];

export function getLoginDestination(from, role) {
    const fallback = getRoleHome(role);
    const pathname = from?.pathname;
    const search = from?.search ?? "";

    if (typeof pathname !== "string" || /[?#\\]/.test(pathname)
        || !(publicPaths.some(path => matchPath({ path, end: true }, pathname))
            || (matchPath({ path: "/admin", end: true }, pathname) && hasPermission(role, PERMISSIONS.ADMIN_ACCESS))
            || (userPaths.some(path => matchPath({ path, end: true }, pathname)) && hasPermission(role, PERMISSIONS.USERS_MANAGE))
            || (matchPath({ path: "/admin/productos", end: true }, pathname) && hasPermission(role, PERMISSIONS.PRODUCTS_VIEW))
            || (productEditPaths.some(path => matchPath({ path, end: true }, pathname)) && hasPermission(role, PERMISSIONS.PRODUCTS_MANAGE))
            || (orderPaths.some(path => matchPath({ path, end: true }, pathname)) && hasPermission(role, PERMISSIONS.ORDERS_VIEW)))
        || typeof search !== "string" || (search !== "" && !search.startsWith("?"))) {
        return fallback;
    }

    return `${pathname}${search}`;
}
