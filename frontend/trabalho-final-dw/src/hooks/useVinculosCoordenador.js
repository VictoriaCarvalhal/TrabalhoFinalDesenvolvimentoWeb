import { useCallback, useEffect, useState } from 'react';
import { buscarMeusVinculos } from '../services/dominioService';

// Vinculos ativos da pessoa logada, que são as matrículas que ela pode usar
// como coordenadora de um projeto. Antes isto buscava os vínculos de todo
// mundo e filtrava no navegador; agora o backend já devolve só os dela.
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

    // recarregar serve para quem acabou de cadastrar um vínculo novo.
    return { dados, loading, erro, recarregar: carregar };
}

export default useVinculosCoordenador;
