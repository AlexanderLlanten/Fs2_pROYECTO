/*
 * Molécula reutilizable.
 * Especializa el diálogo de confirmación con los datos del usuario seleccionado y transmite las demás
 * propiedades al diálogo compartido.
 */

import ConfirmDeleteDialog from "./ConfirmDeleteDialog.jsx";

function DeleteUserDialog({ user, remote = false, ...props }) {
    return <ConfirmDeleteDialog {...props} title={remote ? "Desactivar usuario" : "Eliminar usuario"} confirmLabel={remote ? "Desactivar usuario" : "Eliminar usuario"} busyLabel={remote ? "Desactivando…" : "Eliminando…"}
        description={<>¿Deseas {remote ? "desactivar" : "eliminar"} a <strong>{user.firstName} {user.lastName}</strong>? {remote ? "No podrá iniciar sesión; se conservarán sus compras y datos históricos." : "Su cuenta se eliminará de este navegador."}</>}>
        <p>{user.email}</p>
    </ConfirmDeleteDialog>;
}

export default DeleteUserDialog;
