import React, { useId } from 'react';

// Campo de texto longo do formulário, com o contador de caracteres embaixo.
// Antes os campos tinham só o limite no maxLength, que corta o texto sem
// avisar: quem estava escrevendo não descobria que tinha estourado.
function CampoTextoLongo({ rotulo, campo, limite, valor = '', aoMudar, linhas = 4, obrigatorio = false, ajuda, errosValidacao }) {
    const id = useId();
    const idContador = `${id}-contador`;
    const idAjuda = `${id}-ajuda`;
    const usados = valor.length;
    const perto = usados >= limite * 0.9;
    const erro = errosValidacao?.[campo];

    return (
        <div className="mb-3">
            <label className="form-label" htmlFor={id}>
                {rotulo}{obrigatorio && <span aria-hidden="true"> *</span>}
            </label>

            {ajuda && <div className="form-text mt-0 mb-1" id={idAjuda}>{ajuda}</div>}

            <textarea
                id={id}
                className={`form-control ${erro ? 'is-invalid' : ''}`}
                rows={linhas}
                maxLength={limite}
                required={obrigatorio}
                value={valor}
                aria-describedby={ajuda ? `${idAjuda} ${idContador}` : idContador}
                // o slice garante o limite mesmo se o texto chegar sem passar pelo teclado
                onChange={(e) => aoMudar(campo, e.target.value.slice(0, limite))}
            />

            {erro && <div className="invalid-feedback">{erro}</div>}

            {/* aria-live avisa quem usa leitor de tela quando o limite se aproxima */}
            <div
                id={idContador}
                className={`form-text text-end ${perto ? 'text-warning-emphasis fw-semibold' : ''}`}
                aria-live="polite"
            >
                {usados} de {limite} caracteres
            </div>
        </div>
    );
}

export default CampoTextoLongo;
