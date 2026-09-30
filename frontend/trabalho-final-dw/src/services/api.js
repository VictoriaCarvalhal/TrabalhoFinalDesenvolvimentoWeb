import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/v1`,
});

// Anexa o token de acesso em toda requisição HTTP
api.interceptors.request.use((config) => {
    // Busca do estado do Zustand ou direto do localStorage como fallback
    const token = useAuthStore.getState().token || localStorage.getItem('access');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de resposta com tentativa automática de Refresh Token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se o erro for 401 e ainda não tivermos tentado renovar o token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh');

            if (refreshToken) {
                try {
                    // Tenta obter um novo access token usando o refresh token
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL ?? ''}/api/v1/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    const newAccessToken = data.access;

                    // Atualiza o Zustand e o localStorage com o novo token
                    useAuthStore.getState().setToken?.(newAccessToken);
                    localStorage.setItem('access', newAccessToken);

                    // Reconfigura o cabeçalho com o novo token e refaz a requisição que falhou
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Se a renovação também falhar (refresh token expirado/inválido), desloga o usuário
                    console.error('Sessão expirada. Redirecionando...', refreshError);
                    useAuthStore.getState().logout();
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                }
            } else {
                // Se não existir refresh token salvo, desloga
                useAuthStore.getState().logout();
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
