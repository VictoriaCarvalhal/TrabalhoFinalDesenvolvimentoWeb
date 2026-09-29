import React from 'react';
import CampoTextoLongo from '../CampoTextoLongo';

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

            <CampoTextoLongo
                rotulo="Resultados esperados para o biênio"
                campo="resultados_esperados"
                limite={1000}
                linhas={5}
                valor={form.resultados_esperados}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Cronograma de atividades do biênio"
                campo="cronograma_atividades"
                limite={1000}
                linhas={5}
                valor={form.cronograma_atividades}
                aoMudar={atualizarCampo}
            />

        </fieldset>
    );
}

export default PlanoTrabalho;
