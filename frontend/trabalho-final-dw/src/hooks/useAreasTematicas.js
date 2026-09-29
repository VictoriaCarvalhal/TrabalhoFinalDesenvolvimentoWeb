import { useEffect, useState } from 'react';
import { buscarAreasTematicas } from '../services/dominioService';

export function useAreasTematicas() {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        let cancelado = false;
        setLoading(true);
        setErro(null);
        buscarAreasTematicas()
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