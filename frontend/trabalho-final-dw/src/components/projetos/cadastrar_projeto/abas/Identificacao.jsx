import React from 'react';
import { MUNICIPIOS_RJ } from '../../../../dados/municipiosRJ';

function Identificacao({ form, atualizarCampo, vinculosCoordenador, unidades, departamentos, buscarCep, buscandoCep, avisoCep }) {
    return (
        <fieldset>
            <legend>Identificação</legend>
            <fieldset className="border rounded p-3 m-2">
                <legend>Projeto</legend>
                <div className="mb-3">
                    <label className="form-label">Título do projeto</label>
                    <input
                    type="text"
                    className="form-control"
                    value={form.titulo}
                    onChange={(e) => atualizarCampo("titulo", e.target.value)}
                    />
                </div>
            </fieldset>
            <fieldset className="border rounded p-3 m-2">
                <legend>Coordenador</legend>
                <div className="mb-3">
                    <label className="form-label">Matrícula</label>
                    {/*<input
                        type="number"
                        className="form-control"
                        value={form.matricula_coordenador}
                        onChange={(e) => atualizarCampo("matricula_coordenador", e.target.value)}
                    />*/}
                    <select
                        className="form-select"
                        value={form.coordenador_vinculo}
                        onChange={(e) => {
                            const v = vinculosCoordenador.find((x) => x.id === e.target.value);
                            atualizarCampo('coordenador_vinculo', e.target.value);
                            atualizarCampo('matricula_coordenador', v?.matricula ?? '');
                            atualizarCampo('coordenador', v?.nome_completo ?? '');
                        }}
                    >
                        <option value="">Selecione a matrícula</option>
                        {vinculosCoordenador.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.matricula || 'sem matrícula'} - {v.tipo_vinculo_display}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                    type="text"
                    className="form-control"
                    value={form.coordenador}
                    //onChange={(e) => atualizarCampo("coordenador", e.target.value)}
                    readOnly
                    />
                </div>
            </fieldset>
            <fieldset className="border rounded p-3 m-2">
                <legend>Unidade</legend>
                <div className="mb-3">
                    <label className="form-label">Unidade</label>
                    <select
                        className="form-select"
                        value={form.unidade}
                        onChange={(e) => {
                            atualizarCampo("unidade", e.target.value);
                            atualizarCampo("departamento", "");//acontece em função da unidade
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
                        value={form.departamento}
                        disabled={!form.unidade}
                        onChange={(e) => atualizarCampo("departamento", e.target.value)}
                    >
                        <option value="">
                            {form.unidade ? "Selecione um departamento" : "Escolha uma unidade primeiro"}
                        </option>
                        {departamentos
                            .filter((d) => String(d.unidade) === String(form.unidade))  // <- o String() do item 2
                            .map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.nome}
                                </option>
                            ))}
                    </select>
            
                </div>

            </fieldset>
            <fieldset className="border rounded p-3 m-2">
                <legend>Endereço</legend>
                    <div className="mb-3">
                        <label className="form-label">CEP</label>
                        <input
                            className="form-control"
                            id="cep"
                            placeholder= "00000-000"
                            maxLength={9}
                            value={form.cep}
                                onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                                const fmt = v.length > 5 ? `${v.slice(0,5)}-${v.slice(5)}` : v;
                                atualizarCampo('cep', fmt);
                                }}
                                onBlur={() => buscarCep(form.cep)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Logradouro</label>
                            <input
                                className="form-control"
                                id="logradouro"
                                value={form.logradouro}
                                onChange={(e) => atualizarCampo('logradouro', e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Bairro</label>
                            <input
                                className="form-control"
                                id="logradouro"
                                value={form.bairro}
                                onChange={(e) => atualizarCampo('bairro', e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="municipio">Município</label>
                            <select
                                className="form-select"
                                id="municipio"
                                value={form.municipio}
                                onChange={(e) => atualizarCampo("municipio", e.target.value)}
                            >
                                <option value="">Selecione um município</option>
                                {MUNICIPIOS_RJ.map((m) => (
                                    <option key={m.codigo} value={m.codigo}>
                                        {m.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Numero</label>
                            <input
                                className="form-control"
                                id="numero"
                                value={form.numero}
                                onChange={(e) => atualizarCampo('numero', e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Complemento</label>
                                <input
                                className="form-control"
                                id="complemento"
                                value={form.complemento}
                                onChange={(e) => atualizarCampo('complemento', e.target.value)}
                            />
                        </div>
                    </fieldset>
        </fieldset>
    );
}

export default Identificacao;
