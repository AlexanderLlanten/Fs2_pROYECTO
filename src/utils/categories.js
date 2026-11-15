/** El nombre mostrado coincide con el valor normalizado que se envía al servidor. */
export function getCategoryNameError(value) {
    const name = typeof value === "string" ? value.trim() : "";
    return !name ? "El nombre de la categoría es obligatorio." : name.length > 80 ? "El nombre no puede superar 80 caracteres." : "";
}
