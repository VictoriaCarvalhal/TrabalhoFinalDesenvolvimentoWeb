import React from 'react';

function CartaoItem({ titulo, children, acoes }) {
    return (
        <div className="col-12 col-md-6">
            <div
                className="card shadow h-100 border-0"
                style={{ backgroundColor: 'var(--cor-fundo)' }}
            >
                <div className="card-body d-flex flex-column">
                    <h6
                        className="card-title fw-bold mb-2 text-break"
                        style={{ color: 'var(--cor-titulo-header)' }}
                    >
                        {titulo}
                    </h6>

                    <div
                        className="card-text mb-2 flex-grow-1"
                        style={{ fontSize: '0.9rem', color: 'var(--cor-texto)' }}
                    >
                        {children}
                    </div>

                    {acoes && (
                        <div className="d-flex gap-2 justify-content-end mt-auto pt-2 border-top">
                            {acoes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function DetalheItem({ icone, rotulo, valor }) {
    return (
        <div className="mb-1 text-break">
            <i className={`bi ${icone} me-2`} aria-hidden="true"></i>
            <strong>{rotulo}:</strong> {valor || '—'}
        </div>
    );
}

export default CartaoItem;
