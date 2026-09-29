import React from 'react';

function PlanoTrabalho({ form, atualizarCampo }) {
    return (
        <fieldset>
            <legend>Plano de Trabalho</legend>

            <div className="mb-3">
                <label className="form-label">Ano</label>
                <input
                    type="text"
                    className="form-control"
                    value={new Date().getFullYear()}
                    readOnly
                />
            </div>
            
            <div className="mb-3">
                <label className="form-label">Resultados esperados para o biênio (no máximo 1000 caracteres)</label>
                <textarea
                    className="form-control"
                    maxLength="1000"
                    value={form.resultados_esperados}
                    onChange={(e) => atualizarCampo("resultados_esperados", e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Cronograma de atividades do biênio (no máximo 1000 caracteres)</label>
                <textarea
                    className="form-control"
                    maxLength="1000"
                    value={form.cronograma_atividades}
                    onChange={(e) => atualizarCampo("cronograma_atividades", e.target.value)}
                />
            </div>

        </fieldset>
    );
}

export default PlanoTrabalho;
