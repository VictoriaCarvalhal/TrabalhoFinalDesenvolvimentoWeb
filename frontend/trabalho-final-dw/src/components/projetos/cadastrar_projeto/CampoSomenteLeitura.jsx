import React from 'react';

function CampoSomenteLeitura({ rotulo, valor, ajuda, vazio = '—' }) {
    const mostrar = valor === null || valor === undefined || valor === '' ? vazio : valor;

    return (
        <div className="mb-3">
            <span className="form-label d-block mb-1">{rotulo}</span>
            <output className="d-block fw-semibold">{mostrar}</output>
            {ajuda && <div className="form-text mt-0">{ajuda}</div>}
        </div>
    );
}

export default CampoSomenteLeitura;
