import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const MIN_REFRESH_INTERVAL = 5 * 60 * 1000;

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

            if (agora - lastRefreshTime.current >= MIN_REFRESH_INTERVAL && !isRefreshingGlobal) {
                const refreshToken = localStorage.getItem('refresh');

                if (!refreshToken) {
                    logout('inatividade');
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
                    const newRefreshToken = data.refresh || refreshToken;

                    login(newAccessToken, newRefreshToken);

                    lastRefreshTime.current = Date.now();
                } catch (error) {
                    console.error('Sessão expirada no refresh de inatividade:', error);
                    
                    logout('inatividade');
                    setIsSessionExpired(true);
                } finally {
                    isRefreshingGlobal = false;
                }
            }
        };

        let timerThrottle = null;
        const handleUserActivity = () => {
            if (!timerThrottle) {
                timerThrottle = setTimeout(() => {
                    renovarSessaoSeNecessario();
                    timerThrottle = null;
                }, 1000);
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
