/*
 * Organismo de interfaz.
 * Presenta productos administrativos, disponibilidad y acciones. La propiedad canManage permite
 * ofrecer edición y eliminación únicamente cuando corresponde.
 */

import { Link } from "react-router-dom";
import Price from "../atoms/Price.jsx";
import StockBadge from "../atoms/StockBadge.jsx";

function ProductsTable({ products, canManage, onDelete }) {
    if (!products.length) return <p role="status">No hay productos registrados.</p>;
    return <div className="table-responsive kynex-users-table-wrap" tabIndex={0} role="region" aria-label="Listado de productos">
        <table className="table align-middle kynex-users-table kynex-products-table">
            <caption className="visually-hidden">Productos registrados en KYNEX</caption>
            <thead><tr>{["Código", "Producto", "Categoría", "Precio", "Stock", "Stock crítico", "Estado", "Acciones"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>{products.map(product => <tr key={product.id}>
                <td>{product.code}</td><th scope="row">{product.name}</th><td>{product.category}</td>
                <td><Price value={product.price} /></td><td>{product.stock}</td><td>{product.criticalStock ?? "—"}</td>
                <td><StockBadge stock={product.stock} criticalStock={product.criticalStock} /></td>
                <td><div className="kynex-user-actions">
                    <Link className="btn btn-outline-light btn-sm" to={`/productos/${product.id}`} aria-label={`Ver ${product.name}`}>Ver</Link>
                    {canManage && <>
                        <Link className="btn btn-outline-light btn-sm" to={`/admin/productos/${product.id}/editar`} aria-label={`Editar ${product.name}`}>Editar</Link>
                        <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => onDelete(product)} aria-label={`Eliminar ${product.name}`}>Eliminar</button>
                    </>}
                </div></td>
            </tr>)}</tbody>
        </table>
    </div>;
}

export default ProductsTable;
