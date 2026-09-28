import { create } from "zustand";

export const useAuthStore = create((set) => ({
    isAutenticado: false, 
    token: null,
    nomeUsuario: localStorage.getItem('nomeUsuario') || null,
    login: (tokenRecebido) => set({isAutenticado: true, token: tokenRecebido}),
    setNomeUsuario: (nome) => {
        localStorage.setItem('nomeUsuario', nome);
        set({ nomeUsuario: nome });
    },
    logout: () => {
        localStorage.removeItem('nomeUsuario');
        set({ isAutenticado: false, token: null, nomeUsuario: null });
    },
}))