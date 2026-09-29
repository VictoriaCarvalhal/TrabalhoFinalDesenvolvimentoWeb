import React from 'react';
import CampoTextoLongo from '../CampoTextoLongo';

function Descricao({ form, atualizarCampo }) {
    return (
        <fieldset>
            <legend>Descrição</legend>

            <CampoTextoLongo
                rotulo="Resumo"
                campo="resumo"
                limite={2000}
                linhas={6}
                valor={form.resumo}
                aoMudar={atualizarCampo}
            />

            <div className="mb-3">
                <label className="form-label">Palavra Chave 1</label>
                <input type="text" className="form-control"
                value={form.palavra_chave_1}
                onChange={(e) => atualizarCampo("palavra_chave_1", e.target.value)}/>
            </div>

            <div className="mb-3">
                <label className="form-label">Palavra Chave 2</label>
                <input type="text" className="form-control"
                value={form.palavra_chave_2}
                onChange={(e) => atualizarCampo("palavra_chave_2", e.target.value)}/>
            </div>

            <div className="mb-3">
                <label className="form-label">Palavra Chave 3</label>
                <input type="text" className="form-control"
                value={form.palavra_chave_3}
                onChange={(e) => atualizarCampo("palavra_chave_3", e.target.value)}/>
            </div>

            <CampoTextoLongo
                rotulo="Introdução"
                campo="introducao"
                limite={3000}
                linhas={6}
                valor={form.introducao}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Justificativa"
                campo="justificativa"
                limite={2000}
                linhas={6}
                valor={form.justificativa}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Objetivo geral"
                campo="objetivo_geral"
                limite={500}
                linhas={3}
                valor={form.objetivo_geral}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Objetivos específicos"
                campo="objetivos_especificos"
                limite={1000}
                linhas={4}
                valor={form.objetivos_especificos}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Metodologia e avaliação"
                campo="metodologia_avaliacao"
                limite={2000}
                linhas={5}
                valor={form.metodologia_avaliacao}
                aoMudar={atualizarCampo}
            />

            <div className="mb-3">
                <label className="form-label">Tem relação com ensino?</label>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="relacao_ensino"
                        id="relacao_ensino_sim"
                        value="sim"
                        checked={form.relacao_ensino === "sim"}
                        onChange={(e) => atualizarCampo("relacao_ensino", e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="relacao_ensino_sim">
                        Sim
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="relacao_ensino"
                        id="relacao_ensino_nao"
                        value="nao"
                        checked={form.relacao_ensino === "nao"}
                        onChange={(e) => atualizarCampo("relacao_ensino", e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="relacao_ensino_nao">
                        Não
                    </label>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">Tem relação com Pesquisa?</label>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="relacao_pesquisa"
                        id="relacao_pesquisa_sim"
                        value="sim"
                        checked={form.relacao_pesquisa === "sim"}
                        onChange={(e) => atualizarCampo("relacao_pesquisa", e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="relacao_pesquisa_sim">
                        Sim
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="relacao_pesquisa"
                        id="relacao_pesquisa_nao"
                        value="nao"
                        checked={form.relacao_pesquisa === "nao"}
                        onChange={(e) => atualizarCampo("relacao_pesquisa", e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="relacao_pesquisa_nao">
                        Não
                    </label>
                </div>
            </div>

            <CampoTextoLongo
                rotulo="Interação dialógica"
                campo="interacao_dialogica"
                limite={1000}
                linhas={4}
                valor={form.interacao_dialogica}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Interdisciplinaridade e interprofissionalidade"
                campo="interdisciplinaridade"
                limite={1000}
                linhas={4}
                valor={form.interdisciplinaridade}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Impacto na formação do estudante"
                campo="impacto_formacao"
                limite={1000}
                linhas={4}
                valor={form.impacto_formacao}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Indissociabilidade entre ensino, pesquisa e extensão"
                campo="indissociabilidade"
                limite={1000}
                linhas={4}
                valor={form.indissociabilidade}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Impacto e transformação social"
                campo="impacto_social"
                limite={1000}
                linhas={4}
                valor={form.impacto_social}
                aoMudar={atualizarCampo}
            />

            <CampoTextoLongo
                rotulo="Referências bibliográficas"
                campo="referencias_bibliograficas"
                limite={1000}
                linhas={4}
                valor={form.referencias_bibliograficas}
                aoMudar={atualizarCampo}
            />

        </fieldset>
    );
}

export default Descricao;
