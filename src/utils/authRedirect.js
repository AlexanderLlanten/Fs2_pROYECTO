import { matchPath } from "react-router-dom";
import { getRoleHome, hasPermission, PERMISSIONS } from "./permissions.js";

const publicPaths = ["/", "/productos", "/productos/:id", "/carrito"];

export function getLoginDestination(from, role) {
    const fallback = getRoleHome(role);
    const pathname = from?.pathname;
    const search = from?.search ?? "";

    if (typeof pathname !== "string" || /[?#\\]/.test(pathname)
        || !(publicPaths.some(path => matchPath({ path, end: true }, pathname))
            || (matchPath({ path: "/admin", end: true }, pathname) && hasPermission(role, PERMISSIONS.ADMIN_ACCESS)))
        || typeof search !== "string" || (search !== "" && !search.startsWith("?"))) {
        return fallback;
    }

    return `${pathname}${search}`;
}
