import React from 'react';

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
            <div className="mb-3">
                <label className="form-label">Participação (no máximo 500 caracteres)</label><br/>
                <textarea maxlength="500" cols="35"/>
            </div>


        </fieldset>
    );
}

export default ParceriasInternas;
