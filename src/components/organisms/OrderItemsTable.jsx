// Muestra los productos, cantidades e importes históricos de un pedido.

import { formatPrice } from "../atoms/Price.jsx";

function OrderItemsTable({ products }) {
if (!products.length) return <p role="status">Este pedido no contiene productos.</p>;
return <div className="table-responsive kynex-users-table-wrap" tabIndex={0} role="region"
    aria-label="Productos del pedido">
    <table className="table align-middle kynex-users-table kynex-order-items-table">
        <caption className="visually-hidden">Detalle de productos del pedido</caption>
        <thead>
            <tr>{["Producto", "Precio unitario", "Cantidad", "Total"].map(label => <th key={label} scope="col">{label}
                </th>)}</tr>
        </thead>
        <tbody>{products.map((product, index) => <tr key={`${product.id}-${index}`}>
                <th scope="row">{product.name}</th>
                <td className="text-nowrap">{formatPrice(product.price)}</td>
                <td>{product.quantity}</td>
                <td className="text-nowrap">{formatPrice(product.price * product.quantity)}</td>
            </tr>)}</tbody>
    </table>
</div>;
}

export default OrderItemsTable;
