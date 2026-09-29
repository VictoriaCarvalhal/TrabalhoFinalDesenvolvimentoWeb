import { useEffect, useState } from 'react';
import { buscarPerfil, buscarVinculos } from '../services/dominioService';

export function useVinculosCoordenador() {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        let cancelado = false;
        setLoading(true);
        setErro(null);
        async function carregarVinculos() {
            try {
                const perfil = await buscarPerfil();
                const resposta = await buscarVinculos();
                const meus = resposta.data.filter(
                    (v) =>
                        v.pessoa === perfil.data.id &&
                        v.status === 'ATIVO'
                );
                if (!cancelado) {
                    setDados(meus);
                }
            } catch (e) {
                if (!cancelado) {
                    setErro(e?.response?.status ?? 'rede');
                }
            } finally {
                if (!cancelado) {
                    setLoading(false);
                }
            }
        }
        carregarVinculos();
        return () => {
            cancelado = true;
        };
    }, []);
    return { dados, loading, erro };
}

export default useVinculosCoordenador;