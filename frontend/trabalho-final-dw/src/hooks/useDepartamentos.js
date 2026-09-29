import { useEffect, useState } from 'react';
import { buscarDepartamentos } from '../services/dominioService';

export function useDepartamentos() {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        let cancelado = false;
        setLoading(true);
        setErro(null);
        buscarDepartamentos()
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