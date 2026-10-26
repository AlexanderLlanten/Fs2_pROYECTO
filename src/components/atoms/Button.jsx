function Button({
    children,
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
    onClick
}) {
    const bootstrapVariant =
        variant === "secondary"
            ? "btn-outline-light"
            : "btn-success";

    return (
        <button
            type={type}
            className={`btn ${bootstrapVariant} ${className}`.trim()}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default Button;
