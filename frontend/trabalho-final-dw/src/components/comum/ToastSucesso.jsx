import { useEffect } from 'react';

function ToastSucesso({ mensagem, aoFechar }) {
    useEffect(() => {
        const temporizador = window.setTimeout(aoFechar, 4000);
        return () => window.clearTimeout(temporizador);
    }, [aoFechar, mensagem]);

    return (
        <div className="position-fixed top-0 start-0 end-0 d-flex justify-content-center px-3" style={{ zIndex: 1100, pointerEvents: 'none' }}>
            <div className="toast show align-items-center mt-3 border-success shadow" role="status" style={{ pointerEvents: 'auto', maxWidth: '100%' }}>
                <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success ms-3 fs-5" aria-hidden="true"></i>
                    <div className="toast-body flex-grow-1">{mensagem}</div>
                    <button type="button" className="btn-close me-2" aria-label="Fechar aviso" onClick={aoFechar}></button>
                </div>
            </div>
        </div>
    );
}

export default ToastSucesso;
