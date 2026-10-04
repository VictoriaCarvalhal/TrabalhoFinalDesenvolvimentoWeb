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
        // Trava o scroll da página de fundo enquanto o diálogo está aberto.
        const anterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', aoTeclar);
            document.body.style.overflow = anterior;
        };
    }, [aoFechar]);

    return (
        <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-dialogo-visualizacao"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', overflowY: 'auto' }}
            onClick={aoFechar}
        >
            {/* Sem modal-dialog-centered: centralizar corta o topo quando o
                conteúdo é maior que a tela. Sem ele o diálogo alinha no topo
                e o modal-body rola por dentro. */}
            <div
                className="modal-dialog modal-lg modal-dialog-scrollable"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content" style={{ maxHeight: 'calc(100vh - 2rem)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div className="modal-header" style={{ flexShrink: 0 }}>
                        <h2 className="modal-title h5" id="titulo-dialogo-visualizacao">{titulo}</h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar}></button>
                    </div>

                    <div className="modal-body" style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
                        {children}
                    </div>

                    <div className="modal-footer" style={{ flexShrink: 0 }}>
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