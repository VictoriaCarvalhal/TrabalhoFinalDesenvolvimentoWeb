import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjetoImpressao } from '../../../hooks/useProjetoImpressao';
import ProjetoPrint from '../imprimir/ProjetoPrint';
import '../imprimir/imprimir.css';
import './dialogo.css';

// Diálogo que mostra todos os dados de um projeto sem passar pela tela de
// impressão. Usa o mesmo endpoint e o mesmo componente do relatório, então o
// que aparece aqui é exatamente o que sai no papel.
function DialogoDadosProjeto({ projetoId, aoFechar }) {
    const { dados, loading, erro } = useProjetoImpressao(projetoId);
    const navigate = useNavigate();

    // Esc fecha, como em qualquer diálogo.
    useEffect(() => {
        const aoTeclar = (e) => {
            if (e.key === 'Escape') aoFechar();
        };
        document.addEventListener('keydown', aoTeclar);
        return () => document.removeEventListener('keydown', aoTeclar);
    }, [aoFechar]);

    const titulo = dados?.projeto?.titulo ?? 'Dados do projeto';

    return (
        <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-dados-projeto"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            // clicar fora fecha, mas o clique dentro do conteúdo não sobe
            onClick={aoFechar}
        >
            <div
                className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title h5" id="titulo-dados-projeto">{titulo}</h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar}></button>
                    </div>

                    <div className="modal-body">
                        {loading && <p className="mb-0">Carregando dados do projeto...</p>}

                        {!loading && erro && (
                            <div className="alert alert-danger mb-0" role="alert">
                                Não foi possível carregar os dados deste projeto.
                            </div>
                        )}

                        {!loading && !erro && dados && (
                            <div className="dialogo-dados">
                                <ProjetoPrint dados={dados} geradoEm={null} geradoPor={null} />
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={aoFechar}>
                            Fechar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={loading || Boolean(erro)}
                            onClick={() => navigate(`/Projetos/${projetoId}/imprimir`)}
                        >
                            <i className="bi bi-printer me-2" aria-hidden="true"></i>
                            Ir para a impressão
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DialogoDadosProjeto;
