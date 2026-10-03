import { create } from "zustand";

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('access') || null, // Tenta recuperar do localStorage na inicialização para o F5 não deslogar
    isAutenticado: !!localStorage.getItem('access'), // Se existir o token no localStorage, inicia como true
    nomeUsuario: localStorage.getItem('nomeUsuario') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true', // Flag de admin (is_staff ou is_superuser no backend): so admin ve a lixeira.
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
        localStorage.setItem('nomeUsuario', nome || '');
        set({ nomeUsuario: nome });
    },

    // Guarda se o usuario logado é admin (para exibir ou nao a lixeira).
    setAdmin: (admin) => {
        const valor = Boolean(admin);
        localStorage.setItem('isAdmin', String(valor));
        set({ isAdmin: valor });
    },

    setPerfil: (perfil) => {
        // Se perfil for objeto, serializa para JSON string. Se for string, salva diretamente.
        const valorParaSalvar = typeof perfil === 'object' && perfil !== null 
            ? JSON.stringify(perfil) 
            : perfil;

        localStorage.setItem('perfil', valorParaSalvar || '');
        
        // Atualiza apenas a propriedade perfil na store sem sobrescrever o isAdmin
        set({ perfil: perfil });
    },

    // Função de Logout: limpa a memória e o localStorage
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
