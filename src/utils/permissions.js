export const PERMISSIONS = Object.freeze({
    ADMIN_ACCESS: "admin:access",
    PRODUCTS_VIEW: "admin:products:view",
    PRODUCTS_MANAGE: "admin:products:manage",
    USERS_MANAGE: "admin:users:manage",
    ORDERS_VIEW: "admin:orders:view"
});

const permissionsByRole = Object.freeze({
    Cliente: Object.freeze([]),
    Vendedor: Object.freeze([PERMISSIONS.ADMIN_ACCESS, PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW]),
    Administrador: Object.freeze(Object.values(PERMISSIONS))
});

export function hasPermission(role, permission) {
    return Object.hasOwn(permissionsByRole, role)
        && permissionsByRole[role].includes(permission);
}

export function getRoleHome(role) {
    return hasPermission(role, PERMISSIONS.ADMIN_ACCESS) ? "/admin" : "/productos";
}
