function Badge({
    children,
    className = ""
}) {
    return (
        <span
            className={`kynex-badge ${className}`.trim()}
        >
            {children}
        </span>
    );
}

export default Badge;
