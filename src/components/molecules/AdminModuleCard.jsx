/*
 * Molécula reutilizable.
 * Presenta un acceso a un módulo administrativo mediante título, descripción, icono y destino o
 * acción recibidos.
 */

import { useId } from "react";
import { Link } from "react-router-dom";

function AdminModuleCard({ title, description, icon, to, action }) {
    const titleId = useId();
    return <article className="kynex-admin-info kynex-admin-module" aria-labelledby={titleId}>
        <i className={`bi ${icon}`} aria-hidden="true" />
        <div><h3 id={titleId}>{title}</h3><p>{description}</p></div>
        <Link className="btn btn-outline-light" to={to}>{action}</Link>
    </article>;
}

export default AdminModuleCard;
