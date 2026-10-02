import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // Intervalo mínimo entre renovações ativas (5 minutos nesse caso)


export function useAutoRefreshOnActivity() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const setToken = useAuthStore((state) => state.setToken);
    const logout = useAuthStore((state) => state.logout);
    
    const lastRefreshTime = useRef(Date.now());
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    useEffect(() => {
        if (!isAutenticado) return;

        const renovarSessaoSeNecessario = async () => {
            const agora = Date.now();

            if (agora - lastRefreshTime.current >= MIN_REFRESH_INTERVAL) {  // Só tenta renovar se já tiver passado o tempo mínimo configurado
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
                    console.error('Sessão expirada por inatividade:', error);
                    
                    // Em vez de redirecionar imediatamente, faz o logout e ativa o estado do Pop-up
                    logout();
                    setIsSessionExpired(true);
                }
            }
        };

        const handleUserActivity = () => renovarSessaoSeNecessario();
        const handleVisibilityChange = () => { // Trata o retorno do usuário para a aba do sistema
            if (document.visibilityState === 'visible') renovarSessaoSeNecessario();
        };

        const eventosInteracao = ['click', 'keydown', 'scroll', 'touchstart'];

        eventosInteracao.forEach((evento) => {
            window.addEventListener(evento, handleUserActivity, { passive: true });
        });
        document.addEventListener('visibilitychange', handleVisibilityChange); // Monitor de retorno à aba (troca de aba/janela)

        return () => { // Limpeza dos ouvintes ao desmontar ou deslogar
            eventosInteracao.forEach((evento) => {
                window.removeEventListener(evento, handleUserActivity);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange); 
        };
    }, [isAutenticado, setToken, logout]);

    const closeSessionExpiredModal = () => {
        setIsSessionExpired(false);
        window.location.href = '/'; // Redireciona para o login após fechar o aviso
    };

    return { isSessionExpired, closeSessionExpiredModal };
}
