import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getPeriodoAtual } from '../services/periodoService';

export function usePeriodo() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const recarregar = useCallback(() => {
        // Sem token não há o que buscar; assume aberto para não travar telas públicas.
        if (!useAuthStore.getState().isAutenticado) {
            setDados(null);
            setErro(null);
            setLoading(false);
            return Promise.resolve(null);
        }
        setLoading(true);
        setErro(null);
        return getPeriodoAtual()
            .then((periodo) => {
                setDados(periodo);
                return periodo;
            })
            .catch((e) => {
                setErro(e?.response?.status ?? 'rede');
                return null;
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let cancelado = false;
        if (!isAutenticado) {
            setDados(null);
            setErro(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setErro(null);
        getPeriodoAtual()
            .then((periodo) => {
                if (!cancelado) {
                    setDados(periodo);
                }
            })
            .catch((e) => {
                if (!cancelado) {
                    setErro(e?.response?.status ?? 'rede');
                }
            })
            .finally(() => {
                if (!cancelado) {
                    setLoading(false);
                }
            });
        return () => {
            cancelado = true;
        };
    }, [isAutenticado]);

    // Antes de carregar (ou se der erro de rede), assume aberto para não
    // esconder botões por engano. Quem consome deve respeitar `loading`.
    const aberto = dados ? Boolean(dados.aberto_efetivo) : true;
    return { dados, aberto, loading, erro, recarregar };
}

export default usePeriodo;
