import { useCallback, useEffect, useState } from 'react';
import { buscarMeusVinculos } from '../services/dominioService';

export function useVinculosCoordenador() {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        setErro(null);
        try {
            const resposta = await buscarMeusVinculos();
            setDados(resposta.data.filter((v) => v.status === 'ATIVO'));
        } catch (e) {
            setErro(e?.response?.status ?? 'rede');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    return { dados, loading, erro, recarregar: carregar };
}

export default useVinculosCoordenador;
