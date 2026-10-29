/*
 * Reglas y funciones auxiliares.
 * Declara permisos y su asignación a Cliente, Vendedor y Administrador. Resuelve si un rol dispone de
 * un permiso y su destino inicial.
 */

export const PERMISSIONS = Object.freeze({
    ADMIN_ACCESS: "admin:access",
    PRODUCTS_VIEW: "admin:products:view",
    PRODUCTS_MANAGE: "admin:products:manage",
    USERS_MANAGE: "admin:users:manage",
    ORDERS_VIEW: "admin:orders:view"
});

// La matriz concentra qué puede hacer cada perfil. Una misma regla se reutiliza en navegación, rutas
// y servicios.
const permissionsByRole = Object.freeze({
    Cliente: Object.freeze([]),
    Vendedor: Object.freeze([PERMISSIONS.ADMIN_ACCESS, PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW]),
    Administrador: Object.freeze(Object.values(PERMISSIONS))
});

// Consulta la matriz de permisos del rol y devuelve un booleano.
export function hasPermission(role, permission) {
    return Object.hasOwn(permissionsByRole, role)
        && permissionsByRole[role].includes(permission);
}

// Devuelve el panel para quien tiene acceso administrativo y el catálogo para los demás perfiles.
export function getRoleHome(role) {
    return hasPermission(role, PERMISSIONS.ADMIN_ACCESS) ? "/admin" : "/productos";
}
