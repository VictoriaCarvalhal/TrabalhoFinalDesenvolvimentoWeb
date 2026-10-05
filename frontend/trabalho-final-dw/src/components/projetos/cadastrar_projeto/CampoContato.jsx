import React, { useId, useState } from 'react';
import { aplicarMascaraTelefone, formatarEmail, validarEmail, validarTelefone } from '../../../utils/mascaras';

function CampoContato({ rotulo, tipoEntrada, placeholder, valor, indice, total, aoMudar, aoAdicionar, aoRemover, erro }) {
    const id = useId();
    const ultimo = indice === total - 1;
    const [tocado, setTocado] = useState(false);
    const [tentouAdicionar, setTentouAdicionar] = useState(false);

    const handleChange = (e) => {
        let novoValor = e.target.value;
        if (tipoEntrada === 'tel') {
            novoValor = aplicarMascaraTelefone(novoValor);
        } else if (tipoEntrada === 'email') {
            novoValor = formatarEmail(novoValor);
        }
        aoMudar(indice, novoValor);
    };

    const temValor = Boolean(valor && valor.trim());

    let mensagemErro = null;
    if (temValor) {
        if (tipoEntrada === 'email' && !validarEmail(valor)) {
            mensagemErro = 'Insira um e-mail válido (ex: nome@exemplo.com)';
        } else if (tipoEntrada === 'tel' && !validarTelefone(valor)) {
            mensagemErro = 'Insira um telefone válido com DDD (10 ou 11 dígitos)';
        }
    } else if (tentouAdicionar) {
        mensagemErro = `Preencha este campo antes de adicionar outro.`;
    }
    
    if (!mensagemErro) {
        mensagemErro = erro ?? null;
    }

    const handleAdicionar = () => {
        setTocado(true);
        setTentouAdicionar(true);

        if (!temValor) {
            return;
        }
        if (tipoEntrada === 'email' && !validarEmail(valor)) {
            return;
        }
        if (tipoEntrada === 'tel' && !validarTelefone(valor)) {
            return;
        }

        setTentouAdicionar(false);
        aoAdicionar();
    };

    return (
        <div className="mb-3 d-flex align-items-start gap-2">
            <div className="flex-grow-1">
                <label className="form-label" htmlFor={id}>{rotulo}</label>
                <input
                    id={id}
                    className={`form-control ${mensagemErro ? 'is-invalid' : ''}`}
                    type={tipoEntrada === 'tel' ? 'tel' : tipoEntrada === 'email' ? 'email' : 'text'}
                    placeholder={placeholder}
                    value={valor}
                    onChange={handleChange}
                    onBlur={() => setTocado(true)}
                />
                {mensagemErro && <div className="invalid-feedback">{mensagemErro}</div>}
            </div>

            <div style={{ marginTop: '32px' }}>
                {ultimo ? (
                    <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        title={`Adicionar outro ${rotulo.toLowerCase()}`}
                        aria-label={`Adicionar outro ${rotulo.toLowerCase()} ao final da lista`}
                        onClick={handleAdicionar}
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
        </div>
    );
}

export default CampoContato;

