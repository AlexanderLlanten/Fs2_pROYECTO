import { Link } from "react-router-dom";

export default function CategoriesTable({ categories, onDeactivate, busy = false }) {
    if (!categories.length) return <p role="status">No hay categorías activas. Crea una para organizar los productos.</p>;
    return <div className="table-responsive kynex-users-table-wrap" role="region" aria-label="Listado de categorías" tabIndex={0}>
        <table className="table align-middle kynex-users-table"><caption className="visually-hidden">Categorías activas de KYNEX</caption>
            <thead><tr><th scope="col">Nombre</th><th scope="col">Acciones</th></tr></thead>
            <tbody>{categories.map(category => <tr key={category.id}><th scope="row">{category.name}</th>
                <td><div className="kynex-user-actions"><Link className="btn btn-outline-light btn-sm" to={`/admin/categorias/${category.id}/editar`} aria-label={`Editar categoría ${category.name}`}>Editar</Link>
                    <button className="btn btn-outline-danger btn-sm" type="button" disabled={busy} onClick={() => onDeactivate(category)} aria-label={`Desactivar categoría ${category.name}`}>Desactivar</button></div></td>
            </tr>)}</tbody></table></div>;
}
