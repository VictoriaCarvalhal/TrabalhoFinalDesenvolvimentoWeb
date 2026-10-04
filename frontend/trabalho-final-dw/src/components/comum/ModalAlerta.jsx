import { useEffect } from 'react';

const ICONES = {
    erro: 'bi-exclamation-triangle-fill text-danger',
    aviso: 'bi-exclamation-triangle-fill text-warning',
    sucesso: 'bi-check-circle-fill text-success',
    info: 'bi-info-circle-fill text-primary',
};

function ModalAlerta({ variante = 'erro', titulo, mensagem, detalhes = [], textoBotao = 'Entendi', aoFechar, textoConfirmar = null, aoConfirmar = null, confirmando = false, classeBotaoConfirmar = 'btn-danger' }) {
    useEffect(() => {
        const aoTeclar = (evento) => {
            if (evento.key === 'Escape' && !confirmando) aoFechar();
        };
        document.addEventListener('keydown', aoTeclar);
        const anterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', aoTeclar);
            document.body.style.overflow = anterior;
        };
    }, [aoFechar, confirmando]);

    const itens = Array.isArray(detalhes) ? detalhes.filter(Boolean) : [detalhes].filter(Boolean);

    return (
        <div
            className="modal d-block"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-alerta"
            aria-describedby={mensagem ? 'mensagem-modal-alerta' : undefined}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', overflowY: 'auto' }}
            onClick={() => { if (!confirmando) aoFechar(); }}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                onClick={(evento) => evento.stopPropagation()}
            >
                <div className="modal-content modal-alerta-entrada">
                    <div className="modal-header">
                        <h2 className="modal-title h5" id="titulo-modal-alerta">
                            <i className={`bi ${ICONES[variante] ?? ICONES.erro} me-2`} aria-hidden="true"></i>
                            {titulo}
                        </h2>
                        <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar} disabled={confirmando}></button>
                    </div>
                    <div className="modal-body">
                        {mensagem && <p id="mensagem-modal-alerta">{mensagem}</p>}
                        {itens.length > 0 && (
                            <ul className="mb-0 ps-3">
                                {itens.map((item, indice) => (
                                    <li key={indice} className="mb-1 text-break">{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="modal-footer">
                        {textoConfirmar ? (
                            <>
                                <button type="button" className="btn btn-outline-secondary" onClick={aoFechar} disabled={confirmando}>
                                    Cancelar
                                </button>
                                <button type="button" className={`btn ${classeBotaoConfirmar}`} onClick={aoConfirmar} disabled={confirmando}>
                                    {confirmando && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                                    {textoConfirmar}
                                </button>
                            </>
                        ) : (
                            <button type="button" className="btn btn-primary" onClick={aoFechar}>
                                {textoBotao}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalAlerta;
