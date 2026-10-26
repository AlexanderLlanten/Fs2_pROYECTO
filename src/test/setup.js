import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom no implementa el desplazamiento del navegador.
window.scrollTo = vi.fn();
