import { matchPath } from "react-router-dom";

const publicPaths = ["/", "/productos", "/productos/:id", "/carrito"];

export function getLoginDestination(from) {
    const fallback = "/productos";
    const pathname = from?.pathname;
    const search = from?.search ?? "";

    if (typeof pathname !== "string" || /[?#\\]/.test(pathname)
        || !publicPaths.some(path => matchPath({ path, end: true }, pathname))
        || typeof search !== "string" || (search !== "" && !search.startsWith("?"))) {
        return fallback;
    }

    return `${pathname}${search}`;
}
