import { useEffect, useId, useRef } from "react";

function ConfirmDeleteDialog({ title, description, confirmLabel, children, onCancel, onConfirm, busy, error }) {
    const dialogRef = useRef(null);
    const cancelRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();
    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        dialog.showModal();
        cancelRef.current.focus();
        return () => {
            dialog.close();
            if (previousFocus?.isConnected) previousFocus.focus();
            else document.querySelector("main")?.focus();
        };
    }, []);

    return <dialog ref={dialogRef} className="kynex-user-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
        onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
        <h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p>
        {children}
        {error && <p className="auth-form-alert" role="alert">{error}</p>}
        <div className="auth-form-actions">
            <button ref={cancelRef} className="btn btn-outline-light" type="button" disabled={busy} onClick={onCancel}>Cancelar</button>
            <button className="btn btn-danger" type="button" disabled={busy} onClick={onConfirm}>{busy ? "Eliminando…" : confirmLabel}</button>
        </div>
    </dialog>;
}

export default ConfirmDeleteDialog;
