import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { ROTAS } from '../utils/rotas.js';

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
        // Busca o token no localStorage ou Zustand
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

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isPublicAuthRoute = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
            originalRequest.url?.includes(endpoint)
        );

        if (isPublicAuthRoute) {
            return Promise.reject(error);
        }

        // Trata erro 401 em rotas protegidas
        if (error.response?.status === 401 && !originalRequest._retry) {
            
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
                    const newRefreshToken = data.refresh || refreshToken;

                    // Atualiza Zustand e localStorage
                    const { login, setToken } = useAuthStore.getState();
                    if (login) {
                        login(newAccessToken, newRefreshToken);
                    } else if (setToken) {
                        setToken(newAccessToken);
                        localStorage.setItem('access', newAccessToken);
                        localStorage.setItem('refresh', newRefreshToken);
                    }

                    // Atualiza o header padrão do Axios
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);

                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);

                    useAuthStore.getState().logout?.();
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    if (window.location.pathname !== ROTAS.INICIAL) {
                        window.location.href = ROTAS.INICIAL;
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                useAuthStore.getState().logout?.();
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                if (window.location.pathname !== ROTAS.INICIAL) {
                    window.location.href = ROTAS.INICIAL;
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
