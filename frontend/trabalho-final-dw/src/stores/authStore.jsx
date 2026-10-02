import { create } from "zustand";

export const useAuthStore = create((set) => ({
    // Tenta recuperar do localStorage na inicialização para o F5 não deslogar
    token: localStorage.getItem('access') || null,
    isAutenticado: !!localStorage.getItem('access'), // Se existir o token no localStorage, inicia como true
    nomeUsuario: localStorage.getItem('nomeUsuario') || null,
    perfil: localStorage.getItem('perfil') || null,
    // Função de Login: armazena no estado e grava no localStorage
    login: (tokenRecebido, refreshTokenRecebido = null) => {
        if (tokenRecebido) {
            localStorage.setItem('access', tokenRecebido);
        }
        if (refreshTokenRecebido) {
            localStorage.setItem('refresh', refreshTokenRecebido);
        }
        set({ isAutenticado: true, token: tokenRecebido });
    },
    // Permite atualizar apenas o access token (usado no Refresh Silencioso do api.js)
    setToken: (novoToken) => {
        localStorage.setItem('access', novoToken);
        set({ token: novoToken, isAutenticado: true });
    },
    setNomeUsuario: (nome) => {
        localStorage.setItem('nomeUsuario', nome);
        set({ nomeUsuario: nome });
    },
    setPerfil: (perfil) => {
        localStorage.setItem('perfil', perfil);
        set({ perfil: perfil });
    },
    // Função de Logout: limpa a memória e o localStorage
    logout: () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('nomeUsuario');
        localStorage.removeItem('perfil');
        set({ isAutenticado: false, token: null, nomeUsuario: null, perfil: null });
    },
}));
