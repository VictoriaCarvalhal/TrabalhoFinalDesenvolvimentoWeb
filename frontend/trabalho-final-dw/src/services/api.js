import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/v1`,
});

// Controle de concorrência para o Refresh Token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Lista de rotas públicas
const PUBLIC_AUTH_ENDPOINTS = [
    '/auth/login/',
    '/auth/token/',
    '/auth/register/',
    '/auth/refresh/',
];

// 1. Interceptor de requisição
api.interceptors.request.use((config) => {
    const isPublicAuthRoute = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
        config.url?.includes(endpoint)
    );

    if (!isPublicAuthRoute) {
        // Busca sempre o token mais recente disponível
        const token = localStorage.getItem('access') || useAuthStore.getState().token;
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

        // Se não houver config ou for erro de rede sem resposta do servidor, rejeita
        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isPublicAuthRoute = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
            originalRequest.url?.includes(endpoint)
        );

        // Erros em rotas públicas são repassados ao componente
        if (isPublicAuthRoute) {
            return Promise.reject(error);
        }

        // Se der 401 em rota protegida e ainda não tentou o retry nesta requisição
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Se já houver um refresh em andamento, coloca a requisição na fila de espera
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh');

            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL ?? ''}/api/v1/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    const newAccessToken = data.access;

                    // Atualiza Zustand e localStorage
                    useAuthStore.getState().setToken?.(newAccessToken);
                    localStorage.setItem('access', newAccessToken);

                    // Atualiza o header padrão do Axios para chamadas futuras
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    // Libera todas as requisições que estavam aguardando na fila
                    processQueue(null, newAccessToken);

                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);

                    // Limpa sessão e redireciona
                    useAuthStore.getState().logout?.();
                    if (window.location.pathname !== '/') {
                        window.location.href = '/';
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // Sem refresh token disponível
                useAuthStore.getState().logout?.();
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
