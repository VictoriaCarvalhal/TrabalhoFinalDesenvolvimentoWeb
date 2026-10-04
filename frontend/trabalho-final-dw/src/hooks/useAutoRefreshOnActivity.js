import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos entre renovações por inatividade

// Trava global fora do hook para evitar que múltiplas instâncias ou chamadas simultâneas
// façam refresh ao mesmo tempo no backend
let isRefreshingGlobal = false;

export function useAutoRefreshOnActivity() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    
    const lastRefreshTime = useRef(Date.now());
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    useEffect(() => {
        if (!isAutenticado) return;

        const renovarSessaoSeNecessario = async () => {
            const agora = Date.now();

            // Só tenta renovar se o intervalo mínimo tiver passado e se NÃO houver outro refresh em andamento
            if (agora - lastRefreshTime.current >= MIN_REFRESH_INTERVAL && !isRefreshingGlobal) {
                const refreshToken = localStorage.getItem('refresh');

                if (!refreshToken) {
                    logout();
                    setIsSessionExpired(true);
                    return;
                }

                isRefreshingGlobal = true;

                try {
                    const { data } = await axios.post(
                        `${import.meta.env.VITE_API_URL ?? ''}/api/v1/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    const newAccessToken = data.access;
                    // Se a API retornar um novo refresh token (rotação), atualizamos ambos
                    const newRefreshToken = data.refresh || refreshToken;

                    // Atualiza Zustand e localStorage via action padronizada
                    login(newAccessToken, newRefreshToken);

                    lastRefreshTime.current = Date.now();
                } catch (error) {
                    console.error('Sessão expirada no refresh de inatividade:', error);
                    
                    logout();
                    setIsSessionExpired(true);
                } finally {
                    isRefreshingGlobal = false;
                }
            }
        };

        // Throttle simples: evita checar a todo milissegundo de scroll/digitação
        let timerThrottle = null;
        const handleUserActivity = () => {
            if (!timerThrottle) {
                timerThrottle = setTimeout(() => {
                    renovarSessaoSeNecessario();
                    timerThrottle = null;
                }, 1000); // Checa no máximo 1 vez por segundo durante interações
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                renovarSessaoSeNecessario();
            }
        };

        const eventosInteracao = ['click', 'keydown', 'scroll', 'touchstart'];

        eventosInteracao.forEach((evento) => {
            window.addEventListener(evento, handleUserActivity, { passive: true });
        });
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (timerThrottle) clearTimeout(timerThrottle);
            eventosInteracao.forEach((evento) => {
                window.removeEventListener(evento, handleUserActivity);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange); 
        };
    }, [isAutenticado, login, logout]);

    const closeSessionExpiredModal = () => {
        setIsSessionExpired(false);
        window.location.href = '/';
    };

    return { isSessionExpired, closeSessionExpiredModal };
}
