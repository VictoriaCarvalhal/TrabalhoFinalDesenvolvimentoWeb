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
            aria-labelledby="titulo-dialogo-formulario"
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
                        <h2 className="modal-title h5" id="titulo-dialogo-formulario">{titulo}</h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar}></button>
                    </div>

                    {/* O form permite salvar com Enter e deixa o navegador
                        cobrar os campos obrigatórios antes de chamar o salvar. */}
                    <form
                        style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            aoSalvar();
                        }}
                    >
                        {/* O form quebra o flex do modal-content do Bootstrap
                            (body/footer deixam de ser filhos diretos), então ele
                            precisa ser flex também com minHeight 0 para o body
                            poder rolar por dentro. */}
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
