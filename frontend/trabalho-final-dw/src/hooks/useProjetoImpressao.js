import { useEffect, useState } from 'react';
import api from '../services/api';

// Busca o DTO de impressão de um projeto no backend.
// GET /api/v1/projetos/:id/impressao/ (hoje mockado, sem login).
// Retorna { dados, loading, erro } para a tela de impressão consumir.
export function useProjetoImpressao(id) {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        let cancelado = false;
        setLoading(true);
        setErro(null);

        api.get(`/projetos/${id}/impressao/`)
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
    }, [id]);

    return { dados, loading, erro };
}

export default useProjetoImpressao;
