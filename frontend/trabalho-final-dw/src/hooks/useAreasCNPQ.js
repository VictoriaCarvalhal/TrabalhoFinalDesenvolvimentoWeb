import { useEffect, useState } from 'react';
import { buscarAreasCNPQ } from '../services/dominioService';

export function useAreasCNPQ() {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        let cancelado = false;
        setLoading(true);
        setErro(null);
        buscarAreasCNPQ()
            .then((resposta) => {
                if (!cancelado) {
                    setDados(resposta.data);
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
    }, []);
    return { dados, loading, erro };
}