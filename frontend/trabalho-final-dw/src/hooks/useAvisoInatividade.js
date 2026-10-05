import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// O token de acesso dura 15 minutos. O aviso aparece aos 13, dando 2 minutos
// para a pessoa responder antes de a sessão cair.
const INATIVIDADE_ATE_AVISO = 13 * 60 * 1000;
const SEGUNDOS_PARA_RESPONDER = 120;

export function useAvisoInatividade() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const [avisando, setAvisando] = useState(false);
    const [segundos, setSegundos] = useState(SEGUNDOS_PARA_RESPONDER);
    const timerAviso = useRef(null);

    const encerrarPorInatividade = useCallback(() => {
        setAvisando(false);
        logout('inatividade');
        window.location.href = '/';
    }, [logout]);

    const continuarConectada = useCallback(async () => {
        setAvisando(false);
        const refresh = localStorage.getItem('refresh');
        if (!refresh) return encerrarPorInatividade();
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL ?? ''}/api/v1/auth/refresh/`,
                { refresh }
            );
            login(data.access, data.refresh || refresh);
        } catch {
            encerrarPorInatividade();
        }
    }, [login, encerrarPorInatividade]);

    // Reinicia a contagem a cada sinal de que a pessoa ainda está usando a tela.
    useEffect(() => {
        if (!isAutenticado) return undefined;

        const reiniciar = () => {
            if (timerAviso.current) clearTimeout(timerAviso.current);
            timerAviso.current = setTimeout(() => {
                setSegundos(SEGUNDOS_PARA_RESPONDER);
                setAvisando(true);
            }, INATIVIDADE_ATE_AVISO);
        };

        const eventos = ['click', 'keydown', 'scroll', 'touchstart'];
        eventos.forEach((e) => window.addEventListener(e, reiniciar, { passive: true }));
        reiniciar();

        return () => {
            eventos.forEach((e) => window.removeEventListener(e, reiniciar));
            if (timerAviso.current) clearTimeout(timerAviso.current);
        };
    }, [isAutenticado]);

    // Contagem regressiva do aviso.
    useEffect(() => {
        if (!avisando) return undefined;
        if (segundos <= 0) {
            encerrarPorInatividade();
            return undefined;
        }
        const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [avisando, segundos, encerrarPorInatividade]);

    return { avisando, segundos, continuarConectada, encerrarPorInatividade };
}

export default useAvisoInatividade;
