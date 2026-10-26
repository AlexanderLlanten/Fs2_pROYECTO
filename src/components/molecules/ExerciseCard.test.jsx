import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExerciseCard from "./ExerciseCard.jsx";
import { exercises } from "../../data/exercises.js";

describe("ExerciseCard", () => {
    it("presenta datos y sugerencias recibidos por props y agrega el ejercicio elegido", async () => {
        const onAdd = vi.fn(); const user = userEvent.setup();
        render(<ExerciseCard exercise={exercises[0]} onAdd={onAdd} />);
        expect(screen.getByRole("article", { name: "Press de banca" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Press de banca" })).toHaveAttribute("src", exercises[0].image);
        expect(screen.getByText("4 series × 10 repeticiones")).toBeInTheDocument();
        expect(screen.getByText("Pecho")).toBeInTheDocument();
        await user.click(screen.getByRole("button")); expect(onAdd).toHaveBeenCalledExactlyOnceWith(exercises[0]);
    });
    it("impide volver a agregar un ejercicio y respeta el bloqueo por almacenamiento", () => {
        const { rerender } = render(<ExerciseCard exercise={exercises[0]} added onAdd={vi.fn()} />);
        expect(screen.getByRole("button", { name: "En mi rutina" })).toBeDisabled();
        rerender(<ExerciseCard exercise={exercises[0]} disabled onAdd={vi.fn()} />); expect(screen.getByRole("button")).toBeDisabled();
    });
    it("usa un icono cuando la imagen falla o falta", () => {
        const { rerender, container } = render(<ExerciseCard exercise={exercises[0]} />);
        fireEvent.error(screen.getByRole("img")); expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(container.querySelector(".bi-person-arms-up")).toBeInTheDocument();
        rerender(<ExerciseCard exercise={{ ...exercises[0], image: "", icon: "" }} />);
        expect(container.querySelector(".bi-activity")).toBeInTheDocument();
    });
});
