import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Intervalo mínimo entre renovações ativas (5 minutos nesse caso)
const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; 

export function useAutoRefreshOnActivity() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const setToken = useAuthStore((state) => state.setToken);
    const logout = useAuthStore((state) => state.logout);
    
    const lastRefreshTime = useRef(Date.now());

    useEffect(() => {
        if (!isAutenticado) return;

        const renovarSessaoSeNecessario = async () => {
            const agora = Date.now();

            // Só tenta renovar se já tiver passado o tempo mínimo configurado
            if (agora - lastRefreshTime.current >= MIN_REFRESH_INTERVAL) {
                const refreshToken = localStorage.getItem('refresh');

                if (!refreshToken) return;
                try {
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL ?? ''}/api/v1/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    const newAccessToken = data.access;

                    if (setToken) {
                        setToken(newAccessToken);
                    } else {
                        localStorage.setItem('access', newAccessToken);
                        useAuthStore.setState({ token: newAccessToken, isAutenticado: true });
                    }

                    lastRefreshTime.current = Date.now();
                } catch (error) {
                    console.error('Falha ao auto-renovar a sessão:', error);
                    logout();
                    window.location.href = '/';
                }
            }
        };

        const handleUserActivity = () => {
            renovarSessaoSeNecessario();
        };

        // Trata o retorno do usuário para a aba do sistema
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                renovarSessaoSeNecessario();
            }
        };

        const eventosInteracao = ['click', 'keydown', 'scroll', 'touchstart'];

        eventosInteracao.forEach((evento) => {
            window.addEventListener(evento, handleUserActivity, { passive: true });
        });

        // Monitor de retorno à aba (troca de aba/janela)
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Limpeza dos ouvintes ao desmontar ou deslogar
        return () => {
            eventosInteracao.forEach((evento) => {
                window.removeEventListener(evento, handleUserActivity);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAutenticado, setToken, logout]);
}
