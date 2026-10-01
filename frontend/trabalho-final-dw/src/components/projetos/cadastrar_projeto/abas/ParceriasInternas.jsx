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
                value={form.parceria_nome_instituicao}
                onChange={(e) => atualizarCampo("parceria_nome_instituicao", e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Sigla da Intituição</label>
                <input
                type="text"
                className="form-control"
                value={form.parceria_sigla_instituicao}
                onChange={(e) => atualizarCampo("parceria_sigla_instituicao", e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Unidade</label><br/>
                <select
                    className="form-select"
                    value={form.parceria_unidade}
                    onChange={(e) => {
                        atualizarCampo("parceria_unidade", e.target.value);
                        atualizarCampo("parceria_departamento", "");
                    }}
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
                    value={form.parceria_departamento}
                    disabled={!form.parceria_unidade}
                    onChange={(e) =>
                        atualizarCampo("parceria_departamento", e.target.value)
                    }
                >
                    <option value="">
                        {form.parceria_unidade ? "Selecione um departamento" : "Escolha uma unidade primeiro"}
                    </option>

                    {departamentos
                        .filter((d) => String(d.unidade) === String(form.parceria_unidade))
                        .map((departamento) => (
                            <option
                                key={departamento.id}
                                value={departamento.id}
                            >
                                {departamento.nome}
                            </option>
                        ))}
                </select>
            </div>
            <CampoTextoLongo
                rotulo="Participação da unidade no projeto"
                ajuda="Descreva de que forma essa unidade colabora: o que ela oferece ao projeto (pessoas, espaço, equipamento, dados) e em quais atividades participa."
                campo="parceria_participacao"
                limite={500}
                linhas={4}
                valor={form.parceria_participacao}
                aoMudar={atualizarCampo}
            />


        </fieldset>
    );
}

export default ParceriasInternas;
