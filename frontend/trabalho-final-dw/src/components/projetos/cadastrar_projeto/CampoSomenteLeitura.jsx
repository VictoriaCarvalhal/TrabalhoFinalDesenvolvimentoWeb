import React from 'react';

// Campo que a pessoa não preenche: o valor vem do sistema. Aparece como
// texto, e não como caixa de formulário, porque caixa cinza convida a clicar
// e digitar, e aí nada acontece.
//
// Continua dentro de um elemento de formulário, mas desenhado como texto,
// para quem usa leitor de tela ainda ouvir o rótulo junto com o valor.
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
