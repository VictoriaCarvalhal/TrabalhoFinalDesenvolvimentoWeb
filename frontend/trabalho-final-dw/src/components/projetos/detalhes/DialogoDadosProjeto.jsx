import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjetoImpressao } from '../../../hooks/useProjetoImpressao';
import { gerarPdfPorDados } from '../../../services/gerarProjetoPdf.js';
import ProjetoPrint from '../imprimir/ProjetoPrint';
import '../imprimir/imprimir.css';
import './dialogo.css';

// Diálogo que mostra todos os dados de um projeto sem passar pela tela de
// impressão. Usa o mesmo endpoint e o mesmo componente do relatório, então o
// que aparece aqui é exatamente o que sai no papel.
function DialogoDadosProjeto({ projetoId, aoFechar }) {
    const { dados, loading, erro } = useProjetoImpressao(projetoId);
    const navigate = useNavigate();
    // Download direto do PDF usando os dados já carregados no diálogo.
    const [baixando, setBaixando] = useState(false);
    const [erroDownload, setErroDownload] = useState(null);

    async function handleBaixar() {
        if (!dados) {
            return;
        }
        setBaixando(true);
        setErroDownload(null);
        try {
            await gerarPdfPorDados(dados, { projetoId });
        } catch {
            setErroDownload('Não foi possível baixar o PDF. Tente novamente.');
        } finally {
            setBaixando(false);
        }
    }

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

                        {erroDownload && (
                            <div className="alert alert-danger mt-3 mb-0" role="alert">
                                {erroDownload}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={aoFechar}>
                            Fechar
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            disabled={loading || Boolean(erro)}
                            onClick={() => navigate(`/Projetos/${projetoId}/imprimir`)}
                        >
                            <i className="bi bi-printer me-2" aria-hidden="true"></i>
                            Imprimir
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={loading || Boolean(erro) || baixando}
                            onClick={handleBaixar}
                        >
                            {baixando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Baixando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-download me-2" aria-hidden="true"></i>
                                    Baixar PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DialogoDadosProjeto;
