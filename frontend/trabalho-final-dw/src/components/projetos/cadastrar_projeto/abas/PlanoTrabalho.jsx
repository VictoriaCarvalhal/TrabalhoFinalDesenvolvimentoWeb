import React from 'react';
import CampoTextoLongo from '../CampoTextoLongo';
import CampoSomenteLeitura from '../CampoSomenteLeitura';

function PlanoTrabalho({ form, atualizarCampo, errosValidacao }) {
    return (
        <fieldset>
            <legend>Plano de Trabalho</legend>

            <CampoSomenteLeitura rotulo="Ano" valor={new Date().getFullYear()} />

            <CampoTextoLongo
                rotulo="Resultados esperados para o biênio"
                campo="resultados_esperados"
                limite={1000}
                linhas={5}
                valor={form.resultados_esperados}
                aoMudar={atualizarCampo}
                errosValidacao={errosValidacao}
            />

            <CampoTextoLongo
                rotulo="Cronograma de atividades do biênio"
                campo="cronograma_atividades"
                limite={1000}
                linhas={5}
                valor={form.cronograma_atividades}
                aoMudar={atualizarCampo}
                errosValidacao={errosValidacao}
            />

        </fieldset>
    );
}

export default PlanoTrabalho;
