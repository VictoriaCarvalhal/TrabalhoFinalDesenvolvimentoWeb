import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/v1`,
});

// Lista de rotas onde NÃO é permitido anexar o token antigo nem interceptar erros 401
const PUBLIC_AUTH_ENDPOINTS = [
    '/auth/login/',
    '/auth/token/',
    '/auth/register/',
    '/auth/refresh/',
];

// 1. Interceptor de requisição
api.interceptors.request.use((config) => {
    // Se for uma requisição para login/registro/refresh, não envia o cabeçalho Authorization
    const isPublicAuthRoute = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
        config.url?.includes(endpoint)
    );

    if (!isPublicAuthRoute) {
        const token = useAuthStore.getState().token || localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

// 2. Interceptor de resposta
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Verifica se a rota original era uma rota pública de autenticação
        const isPublicAuthRoute = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
            originalRequest?.url?.includes(endpoint)
        );

        // Se for 401 em uma rota pública (ex: senha errada no login), ignora o interceptor
        // Deixa a promessa ser rejeitada para o formulário tratar o erro normalmente
        if (isPublicAuthRoute) {
            return Promise.reject(error);
        }

        // Se o erro for 401 em uma rota protegida e ainda não houve tentativa de renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh');

            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL ?? ''}/api/v1/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    const newAccessToken = data.access;

                    // Atualiza a store do Zustand e o localStorage
                    useAuthStore.getState().setToken?.(newAccessToken);
                    localStorage.setItem('access', newAccessToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Se o refresh falhar, limpa tudo e desloga
                    console.error('Sessão expirada. Efetuando logout...', refreshError);
                    useAuthStore.getState().logout?.();
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    
                    // Redireciona apenas se não estiver na página de login/home
                    if (window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // Se não há refresh token, apenas limpa a sessão
                useAuthStore.getState().logout?.();
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
