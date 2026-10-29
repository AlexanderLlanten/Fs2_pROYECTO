/*
 * Entrada y configuración.
 * Carga Bootstrap, iconos y estilos propios; busca el contenedor root y monta App dentro de
 * StrictMode.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

// Los estilos propios se cargan después de Bootstrap para aplicar los colores y ajustes de KYNEX.
import "./styles/global.css";
import "./styles/shop.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/auth.css";
import "./styles/admin.css";
import "./styles/contact.css";
import "./styles/training.css";
import "./styles/about.css";
import "./styles/blog.css";

import App from "./App.jsx";

// React toma el contenedor root del HTML y monta allí App. StrictMode agrega comprobaciones en
// desarrollo.
createRoot(
    document.getElementById("root")
).render(
    <StrictMode>
        <App />
    </StrictMode>
);
