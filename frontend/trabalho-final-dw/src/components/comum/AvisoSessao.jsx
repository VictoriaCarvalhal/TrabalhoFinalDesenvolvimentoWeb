import React from 'react';

// Pergunta se a pessoa quer continuar conectada, pouco antes de a sessão cair.
function AvisoSessao({ segundos, aoContinuar, aoSair }) {
    const minutos = Math.floor(segundos / 60);
    const resto = String(segundos % 60).padStart(2, '0');

    return (
        <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-aviso-sessao"
            style={{ zIndex: 1060, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title h5" id="titulo-aviso-sessao">
                            <i className="bi bi-clock-history me-2" aria-hidden="true"></i>
                            Ainda está por aí?
                        </h2>
                    </div>
                    <div className="modal-body">
                        <p className="mb-2">
                            Sua sessão vai encerrar por inatividade em{' '}
                            <strong aria-live="polite">{minutos}:{resto}</strong>.
                        </p>
                        <p className="mb-0 text-body-secondary">
                            Se estiver preenchendo um projeto, continue conectada para não perder o que já escreveu.
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={aoSair}>
                            Sair agora
                        </button>
                        <button type="button" className="btn btn-primary" onClick={aoContinuar}>
                            Continuar conectada
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AvisoSessao;
