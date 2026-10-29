/*
 * Molécula reutilizable.
 * Especializa el diálogo de confirmación con los datos del usuario seleccionado y transmite las demás
 * propiedades al diálogo compartido.
 */

import ConfirmDeleteDialog from "./ConfirmDeleteDialog.jsx";

function DeleteUserDialog({ user, ...props }) {
    return <ConfirmDeleteDialog {...props} title="Eliminar usuario" confirmLabel="Eliminar usuario"
        description={<>¿Deseas eliminar a <strong>{user.firstName} {user.lastName}</strong>? Su cuenta se eliminará de este navegador.</>}>
        <p>{user.email}</p>
    </ConfirmDeleteDialog>;
}

export default DeleteUserDialog;
