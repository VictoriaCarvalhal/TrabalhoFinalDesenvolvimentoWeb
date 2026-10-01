import React, { useEffect } from 'react';

// Caixa de diálogo para incluir ou editar um item de uma aba que tem lista.
// A aba fica só mostrando o que já foi cadastrado, e o preenchimento acontece
// aqui dentro, sem campo solto no meio da tabela.
//
// Quem usa passa os campos como children e cuida do estado; este componente
// só monta a moldura, fecha no Esc e no clique fora, e devolve o salvar.
function DialogoFormulario({ titulo, children, aoSalvar, aoFechar, salvarDesabilitado = false, erro }) {
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
            aria-labelledby="titulo-dialogo-formulario"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={aoFechar}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title h5" id="titulo-dialogo-formulario">{titulo}</h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar}></button>
                    </div>

                    {/* O form permite salvar com Enter e deixa o navegador
                        cobrar os campos obrigatórios antes de chamar o salvar. */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            aoSalvar();
                        }}
                    >
                        <div className="modal-body">
                            {erro && <div className="alert alert-danger py-2">{erro}</div>}
                            {children}
                        </div>

                        <div className="modal-footer">
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
