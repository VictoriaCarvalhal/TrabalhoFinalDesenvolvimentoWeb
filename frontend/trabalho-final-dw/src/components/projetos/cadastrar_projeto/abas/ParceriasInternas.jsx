import React from 'react';
import CampoTextoLongo from '../CampoTextoLongo';

function ParceriasInternas({ form, atualizarCampo, unidades, departamentos }) {
    return (
        <fieldset>
            <legend>
                Parcerias Internas
            </legend>

            <div className="mb-3">
                <label className="form-label">Nome da Instituição</label>
                <input
                type="text"
                className="form-control"
                value={form.area}
                onChange={(e) => atualizarCampo("area", e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Sigla da Intituição</label>
                <input
                type="text"
                className="form-control"
                value={form.sigla}
                onChange={(e) => atualizarCampo("sigla", e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Unidade</label><br/>
                <select
                    className="form-select"
                    value={form.unidade}
                    onChange={(e) => atualizarCampo("unidade", e.target.value)}
                >
                    <option value="">Selecione uma unidade</option>

                    {unidades.map((unidade) => (
                        <option key={unidade.id} value={unidade.id}>
                            {unidade.sigla} — {unidade.nome}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Departamento</label>

                <select
                    className="form-select"
                    value={form.departamento}
                    onChange={(e) =>
                        atualizarCampo("departamento", e.target.value)
                    }
                >
                    <option value="">
                        Selecione um departamento
                    </option>

                    {departamentos.map((departamento) => (
                        <option
                            key={departamento.id}
                            value={departamento.id}
                        >
                            {departamento.unidade_sigla} — {departamento.nome}
                        </option>
                    ))}
                </select>
            </div>
            <CampoTextoLongo
                rotulo="Participação da unidade no projeto"
                ajuda="Descreva de que forma essa unidade colabora: o que ela oferece ao projeto (pessoas, espaço, equipamento, dados) e em quais atividades participa."
                campo="participacao_interna"
                limite={500}
                linhas={4}
                valor={form.participacao_interna}
                aoMudar={atualizarCampo}
            />


        </fieldset>
    );
}

export default ParceriasInternas;
