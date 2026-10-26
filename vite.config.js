import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        react()
    ],

    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/test/setup.js",
        // Cada archivo crea su propio jsdom; limitar procesos evita saturar el equipo.
        maxWorkers: 2,

        coverage: {
            provider: "v8",
            reporter: [
                "text",
                "html",
                "json-summary"
            ],
            include: [
                "src/**/*.{js,jsx}"
            ],
            exclude: [
                "src/main.jsx",
                "src/test/**"
            ]
        }
    }
});
