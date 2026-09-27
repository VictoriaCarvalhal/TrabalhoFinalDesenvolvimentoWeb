import { create } from "zustand";

export const useThemeStore = create((set) => ({
    tema: localStorage.getItem("tema") || "light",
    alternarTema: () =>
        set((state) => {
            const novo = state.tema === "light" ? "dark" : "light";
            localStorage.setItem("tema", novo);
            document.documentElement.setAttribute("data-bs-theme", novo);
            return { tema: novo };
        }),
}));

document.documentElement.setAttribute(
    "data-bs-theme",
    localStorage.getItem("tema") || "light"
);
