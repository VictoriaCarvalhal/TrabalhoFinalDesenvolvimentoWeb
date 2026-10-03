import React, { useEffect } from 'react';

// Caixa de diálogo só de leitura, pra ver os dados completos de um item já
// cadastrado (sem poder editar). Mesma moldura visual do DialogoFormulario,
// mas sem <form> e sem botão de Salvar — só um botão de Fechar.
function DialogoVisualizacao({ titulo, children, aoFechar }) {
    useEffect(() => {
        const aoTeclar = (e) => {
            if (e.key === 'Escape') aoFechar();
        };
        document.addEventListener('keydown', aoTeclar);
        return () => document.removeEventListener('keydown', aoTeclar);
    }, [aoFechar]);

    return (
        <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-dialogo-visualizacao"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={aoFechar}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title h5" id="titulo-dialogo-visualizacao">{titulo}</h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar}></button>
                    </div>

                    <div className="modal-body">
                        {children}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={aoFechar}>
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DialogoVisualizacao;