import React, { useId } from 'react';

// Um telefone ou um e-mail do projeto. O botão ao lado muda conforme a posição:
// o último campo da lista tem "+", que acrescenta mais um embaixo; os anteriores
// têm "−", que tira aquela entrada. Assim a lista nunca fica vazia, porque o
// campo que sobra é sempre o último e só oferece o "+".
function CampoContato({ rotulo, tipoEntrada, placeholder, valor, indice, total, aoMudar, aoAdicionar, aoRemover }) {
    const id = useId();
    const ultimo = indice === total - 1;

    return (
        <div className="mb-3 d-flex align-items-end gap-2">
            <div className="flex-grow-1">
                <label className="form-label" htmlFor={id}>{rotulo}</label>
                <input
                    id={id}
                    className="form-control"
                    type={tipoEntrada}
                    placeholder={placeholder}
                    value={valor}
                    onChange={(e) => aoMudar(indice, e.target.value)}
                />
            </div>

            {ultimo ? (
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    title={`Adicionar outro ${rotulo.toLowerCase()}`}
                    aria-label={`Adicionar outro ${rotulo.toLowerCase()} ao final da lista`}
                    onClick={aoAdicionar}
                >
                    <i className="bi bi-plus-lg" aria-hidden="true"></i>
                </button>
            ) : (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title={`Remover este ${rotulo.toLowerCase()}`}
                    aria-label={`Remover o ${rotulo.toLowerCase()} ${indice + 1}`}
                    onClick={() => aoRemover(indice)}
                >
                    <i className="bi bi-dash-lg" aria-hidden="true"></i>
                </button>
            )}
        </div>
    );
}

export default CampoContato;
