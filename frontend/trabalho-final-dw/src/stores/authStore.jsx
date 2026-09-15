import { create } from "zustand";

export const useAuthStore = create((set) => ({
    isAutenticado: false, 
    token: null,
    login: (tokenRecebido) => set({isAutenticado: true, token: tokenRecebido}),
    logout: () => set({ isAutenticado: false, token: null }),
}))