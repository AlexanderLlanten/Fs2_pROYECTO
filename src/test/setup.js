import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom no implementa el desplazamiento del navegador.
window.scrollTo = vi.fn();

// jsdom no implementa el ciclo nativo de los diálogos modales.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
