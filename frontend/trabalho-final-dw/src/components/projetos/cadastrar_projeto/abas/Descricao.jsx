import React from 'react';

function Descricao({ form, atualizarCampo }) {
    return (
        <fieldset>
            <legend>Descrição</legend>
            <div className="mb-3">
                <label className="form-label">Resumo (no máximo 
                    2000 caracteres)
                </label>
                    <textarea class="form-control" maxlength="2000"
                    value={form.resumo}
                    onChange={(e) => atualizarCampo("resumo", e.target.value)}>
                    </textarea>    
                </div>
                
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

                <div className="mb-3">
                    <label className="form-label">Introdução (no máximo
                        3000 caracteres)
                    </label>
                        <textarea class="form-control" maxlength="3000"
                        value={form.introducao}
                        onChange={(e) => atualizarCampo("introducao", e.target.value)}>
                        </textarea>    
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Justificativa (no máximo 
                            2000 caracteres)
                        </label>
                                <textarea class="form-control" maxlength="2000"
                                value={form.justificativa}
                                onChange={(e) => atualizarCampo("justificativa", e.target.value)}>
                                </textarea>    
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Objetivo Geral (no máximo 
                                    500 caracteres)
                                </label>
                                        <textarea class="form-control" maxlength="500"
                                        value={form.objetivo_geral}
                                        onChange={(e) => atualizarCampo("objetivo_geral", e.target.value)}>
                                        </textarea>    
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Objetivos Específicos (no máximo 
                                            1000 caracteres)
                                        </label>
                                                <textarea
                                                    className="form-control"
                                                    maxLength="1000"
                                                    value={form.objetivo_especifico}
                                                    onChange={(e) => atualizarCampo("objetivo_especifico", e.target.value)}
                                                />    
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Metodologia e Avaliação (no máximo 2000 caracteres)</label>
                                                <textarea
                                                    className="form-control"
                                                    maxLength="2000"
                                                    value={form.metodologia_avaliacao}
                                                    onChange={(e) => atualizarCampo("metodologia_avaliacao", e.target.value)}
                                                />
                                            </div>

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

                                        <div className="mb-3">
                                            <label className="form-label">Interação Dialógica (no máximo 1000 caracteres)</label>
                                            <textarea
                                                className="form-control"
                                                maxLength="1000"
                                                value={form.interacao_dialogica}
                                                onChange={(e) => atualizarCampo("interacao_dialogica", e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Interdisciplinaridade e Interprofissionalidade (no máximo 1000 caracteres)</label>
                                            <textarea
                                                className="form-control"
                                                maxLength="1000"
                                                value={form.interdisciplinaridade_interprofissionalidade}
                                                onChange={(e) => atualizarCampo("interdisciplinaridade_interprofissionalidade", e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Impacto na Formação do Estudante (no máximo 1000 caracteres)</label>
                                            <textarea
                                                className="form-control"
                                                maxLength="1000"
                                                value={form.impacto_formacao}
                                                onChange={(e) => atualizarCampo("impacto_formacao", e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Indissociabilidade Ensino - Pesquisa - Extensão (no máximo 1000 caracteres)</label>
                                            <textarea
                                                className="form-control"
                                                maxLength="1000"
                                                value={form.indissociabilidade}
                                                onChange={(e) => atualizarCampo("indissociabilidade", e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Impacto e Transformação Social (no máximo 1000 caracteres)</label>
                                            <textarea
                                                className="form-control"
                                                maxLength="1000"
                                                value={form.impacto_transformacao_social}
                                                onChange={(e) => atualizarCampo("impacto_transformacao_social", e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Referências Bibliográficas (no máximo 1000 caracteres)</label>
                                            <textarea
                                                className="form-control"
                                                maxLength="1000"
                                                value={form.referencias_bibliograficas}
                                                onChange={(e) => atualizarCampo("referencias_bibliograficas", e.target.value)}
                                            />
                                        </div>

                                        </fieldset>
    );
}

export default Descricao;
