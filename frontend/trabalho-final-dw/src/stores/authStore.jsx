import { create } from "zustand";

const getPerfilInicial = () => {
    const perfilSalvo = localStorage.getItem('perfil');
    if (!perfilSalvo) return null;
    try {
        return JSON.parse(perfilSalvo);
    } catch {
        return perfilSalvo;
    }
};

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('access') || null,
    isAutenticado: !!localStorage.getItem('access'),
    nomeUsuario: localStorage.getItem('nomeUsuario') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    perfil: getPerfilInicial(),

    login: (tokenRecebido, refreshTokenRecebido = null) => {
        if (tokenRecebido) {
            localStorage.setItem('access', tokenRecebido);
        }
        if (refreshTokenRecebido) {
            localStorage.setItem('refresh', refreshTokenRecebido);
        }
        set({ isAutenticado: true, token: tokenRecebido });
    },

    setToken: (novoToken) => {
        if (novoToken) {
            localStorage.setItem('access', novoToken);
            set({ token: novoToken, isAutenticado: true });
        }
    },

    setNomeUsuario: (nome) => {
        if (nome) {
            localStorage.setItem('nomeUsuario', nome);
            set({ nomeUsuario: nome });
        } else {
            localStorage.removeItem('nomeUsuario');
            set({ nomeUsuario: null });
        }
    },

    setAdmin: (admin) => {
        const valor = Boolean(admin);
        localStorage.setItem('isAdmin', String(valor));
        set({ isAdmin: valor });
    },

    setPerfil: (perfil) => {
        if (!perfil) {
            localStorage.removeItem('perfil');
            set({ perfil: null });
            return;
        }

        const valorParaSalvar = typeof perfil === 'object' 
            ? JSON.stringify(perfil) 
            : perfil;

        localStorage.setItem('perfil', valorParaSalvar);
        set({ perfil });
    },

    logout: () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('nomeUsuario');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('perfil');

        set({ 
            isAutenticado: false, 
            token: null, 
            nomeUsuario: null, 
            isAdmin: false, 
            perfil: null 
        });
    },
}));
