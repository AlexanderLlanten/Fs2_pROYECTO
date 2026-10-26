import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

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

createRoot(
    document.getElementById("root")
).render(
    <StrictMode>
        <App />
    </StrictMode>
);
