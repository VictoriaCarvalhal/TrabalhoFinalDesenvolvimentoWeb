import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Um unico cliente para falar com o backend. Em producao front e API ficam
// no mesmo endereco, entao o caminho e relativo; no npm run dev o Vite
// redireciona /api para o runserver do Django (ver vite.config.js).
// VITE_API_URL so e necessaria se o backend estiver em outro endereco.
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api/v1`,
});

// Manda o token do login em toda requisicao, quando houver.
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
