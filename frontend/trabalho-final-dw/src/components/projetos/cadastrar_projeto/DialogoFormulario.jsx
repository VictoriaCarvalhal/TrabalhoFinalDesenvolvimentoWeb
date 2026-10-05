import React, { useEffect } from 'react';

function DialogoFormulario({ titulo, children, aoSalvar, aoFechar, salvarDesabilitado = false, erro }) {
    useEffect(() => {
        const aoTeclar = (e) => {
            if (e.key === 'Escape') aoFechar();
        };
        document.addEventListener('keydown', aoTeclar);
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
            aria-labelledby="titulo-dialogo-formulario"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', overflowY: 'auto' }}
            onClick={aoFechar}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-scrollable"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content" style={{ maxHeight: 'calc(100vh - 2rem)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div className="modal-header" style={{ flexShrink: 0 }}>
                        <h2 className="modal-title h5" id="titulo-dialogo-formulario">{titulo}</h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar}></button>
                    </div>

                    <form
                        style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            aoSalvar();
                        }}
                    >
                        <div className="modal-body" style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0 }}>
                            {erro && <div className="alert alert-danger py-2">{erro}</div>}
                            {children}
                        </div>

                        <div className="modal-footer" style={{ flexShrink: 0 }}>
                            <button type="button" className="btn btn-outline-secondary" onClick={aoFechar}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={salvarDesabilitado}>
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DialogoFormulario;
