// Una sola selección evita mezclar identidades locales con operaciones del servidor.
export const usesApi = import.meta.env.VITE_DATA_SOURCE === "api" || import.meta.env.VITE_CATALOG_SOURCE === "api";
