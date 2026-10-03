import React from 'react';

// "2026-01-31" -> "31/01/2026" sem cair no fuso (Date puro desloca o dia).
function formatarData(iso) {
    if (!iso) return null;
    const partes = String(iso).slice(0, 10).split('-');
    if (partes.length !== 3) return String(iso);
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
}

// Pop-up padrão de indisponibilidade fora do período de extensão.
// Uso: lápis bloqueado, botão criar bloqueado, acesso direto por URL.
function FeedbackIndisponivel({ inicio, fim, mensagem, aoFechar }) {
    const texto = mensagem
        || 'Fora do período de extensão. A criação e a edição de projetos estão indisponíveis no momento.';
    const datas = [formatarData(inicio), formatarData(fim)].filter(Boolean).join(' a ');

    return (
        <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-periodo-fechado"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={aoFechar}
        >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title h5" id="titulo-periodo-fechado">
                            <i className="bi bi-lock-fill me-2" aria-hidden="true"></i>
                            Período de extensão fechado
                        </h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar}></button>
                    </div>
                    <div className="modal-body">
                        <p>{texto}</p>
                        {datas && (
                            <p className="mb-0 text-muted">
                                <i className="bi bi-calendar-event me-2" aria-hidden="true"></i>
                                Período vigente: <strong>{datas}</strong>
                            </p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={aoFechar}>
                            Entendi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedbackIndisponivel;
