import { create } from "zustand";

export const useAuthStore = create((set) => ({
    isAutenticado: true, //false, 
    token: 'token-dev-falso', // null,
    nomeUsuario: localStorage.getItem('nomeUsuario') || 'Usuario Dev', //null ,
    login: (tokenRecebido) => set({isAutenticado: true, token: tokenRecebido}),
    setNomeUsuario: (nome) => {
        localStorage.setItem('nomeUsuario', nome);
        set({ nomeUsuario: nome });
    },
    logout: () => {
        localStorage.removeItem('nomeUsuario');
        // o refresh e guardado no login, entao sai junto
        localStorage.removeItem('refresh');
        set({ isAutenticado: false, token: null, nomeUsuario: null });
    },
}))