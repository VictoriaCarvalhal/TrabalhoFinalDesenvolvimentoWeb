import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import LocaisRealizacao from './abas/LocaisRealizacao';
import MembrosEquipe from './abas/MembrosEquipe';
import UnidadesEnvolvidas from './abas/UnidadesEnvolvidas';

const ABAS = [
    {id: "identificacao", label: "Identificação"},
    {id: "caracterizacao", label: "Caracterização"},
    {id: "descricao", label: "Descrição"},
    {id: "plano-de-trabalho", label: "Plano de Trabalho"},
    {id: "unidades-envolvidas", label: "Unidades Envolvidas"},
    {id: "parcerias-internas", label: "Parcerias Internas"},
    {id: "locais-realizacao", label: "Locais de Realização"},
    {id: "membros-equipe", label: "Membros da Equipe"},
];

function CadastrarProjeto() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const token = useAuthStore((state) => state.token);
    
    const [abaAtiva, setAbaAtiva] = useState("identificacao");

    const [unidades, setUnidades] = useState([]); //Aqui serão armazenadas as unidades que serão obtidas da API para o dropdown
    const [departamentos, setDepartamentos] = useState([]); //Aqui serão armazenados os departamentos que serão obtidas da API para o dropdown

    const [form, setForm] = useState({
        titulo: "",
        coordenador: "",
        matricula_coordenador: "",
        area: "",
        publicoAlvo: "",
        vinculado_extensao: "",
        curricular: "",
        natureza: "",
        abrangencia: "",
        publico_alvo: "",
        area_conhecimento_cnpq: "",
        area_tematica_principal: "",
        area_tematica_secundaria: "",
        linha_extensao: "",
        resumo: "",
        palavra_chave_1: "",
        palavra_chave_2: "",
        palavra_chave_3: "",
        introducao: "",
        justificativa: "",
        ojetivo_geral: "",
        objetivo_especifico: "",
        metodologia_avaliacao: "",
        relacao_ensino: "",
        relacao_pesquisa: "",
        interacao_dialogica: "",
        interdisciplinaridade_interprofissionalidade: "",
        impacto_formacao: "",
        indissociabilidade: "",
        impacto_transformacao_social: "",
        referencias_bibliograficas: "",
        resultados_esperados: "",
        cronograma_atividades: "",
        unidade: "",
        departamento: "",
        locaisRealizacao: [],
        membrosEquipe: [],
        unidadesEnvolvidas: [],
    });

    function atualizarCampo(campo, valor) {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    }

    useEffect(() => {
        async function carregarUnidades() {
            try {
                const resposta = await fetch("/api/v1/dominios/unidades/");

                if (!resposta.ok) {
                    throw new Error(`HTTP ${resposta.status}`);
                }

                const dados = await resposta.json();

                setUnidades(dados);
            } catch (erro) {
                console.error("Erro ao carregar unidades:", erro);
            }
        }

        async function carregarDepartamentos() {
            try {
                const resposta = await fetch("/api/v1/dominios/departamentos/");

                if (!resposta.ok) {
                    throw new Error(`HTTP ${resposta.status}`);
                }

                const dados = await resposta.json();

                setDepartamentos(dados);
            } catch (erro) {
                console.error("Erro ao carregar departamentos:", erro);
            }
        }

        carregarUnidades();
        carregarDepartamentos();
        
    }, []);


    return (
        <div className="container mt-4">
            <h1>Cadastro de Projeto</h1>
            {/* Codigo para testar a autenticacao mockada. Use isso para já programar a logica de mostrar os projetos de um especifico usuario.
             Dessa forma quando o codigo do backend estiver pronto só precisamos adaptar e não criar do zero*/}
             <ul className="nav nav-tabs">
                {ABAS.map((aba) => (
                    <li className="nav-item" key={aba.id}>
                    <a
                        className={`nav-link ${abaAtiva === aba.id ? "active" : ""}`}
                        aria-current={abaAtiva === aba.id ? "page" : undefined}
                        href="#"
                        onClick={(e) => {
                        e.preventDefault();
                        setAbaAtiva(aba.id);
                        }}
                        role="button"
                    >
                        {aba.label}
                    </a>
                    </li>
                ))}
            </ul>
            
            <div className="p-3 border rounded bg-light">
                
                {abaAtiva === "identificacao" && (
                    
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
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.matricula_coordenador}
                                    onChange={(e) => atualizarCampo("matricula_coordenador", e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Nome</label>
                                <input
                                type="text"
                                className="form-control"
                                value={form.coordenador}
                                onChange={(e) => atualizarCampo("coordenador", e.target.value)}
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
                                onChange={(e) => atualizarCampo("unidade", e.target.value)}
                                >

                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Departamento</label>
                                
                                <select 
                                className="form-select"
                                value={form.departamento}
                                onChange={(e) => atualizarCampo("departamento", e.target.value)}
                                >
                                </select>
                        
                            </div>

                        </fieldset>
                        <fieldset className="border rounded p-3 m-2">
                            <legend>Endereço</legend>

                        </fieldset>
                    </fieldset>

                )}

                {abaAtiva === "caracterizacao" && (
                    <fieldset>
                    <legend>
                        Caracterização
                    </legend>
                    
                    <div className="mb-3">
                        <label className="form-label">Área</label>
                        <input
                        type="text"
                        className="form-control"
                        value={form.area}
                        onChange={(e) => atualizarCampo("area", e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">É vinculado a Programa de Extensão?</label>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="vinculado_extensao"
                                id="vinculado_extensao_sim"
                                value="sim"
                                checked={form.vinculado_extensao === "sim"}
                                onChange={(e) => atualizarCampo("vinculado_extensao", e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="vinculado_extensao_sim">
                                Sim
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="vinculado_extensao"
                                id="vinculado_extensao_nao"
                                value="nao"
                                checked={form.vinculado_extensao === "nao"}
                                onChange={(e) => atualizarCampo("vinculado_extensao", e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="vinculado_extensao_nao">
                                Não
                            </label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">É curricular?</label>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="curricular"
                                id="curricular_sim"
                                value="sim"
                                checked={form.curricular === "sim"}
                                onChange={(e) => atualizarCampo("curricular", e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="curricular_sim">
                                Sim
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="curricular"
                                id="curricular_nao"
                                value="nao"
                                checked={form.curricular === "nao"}
                                onChange={(e) => atualizarCampo("curricular", e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="curricular_nao">
                                Não
                            </label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Natureza</label>
                                    
                        <select 
                        className="form-select"
                        value={form.natureza}
                        onChange={(e) => atualizarCampo("natureza", e.target.value)}
                        >

                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Abrangência</label>
                                    
                        <select 
                        className="form-select"
                        value={form.abrangencia}
                        onChange={(e) => atualizarCampo("abrangencia", e.target.value)}
                        >

                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Público Alvo</label>
                        <textarea
                            className="form-control"
                            value={form.publico_alvo}
                            onChange={(e) => atualizarCampo("publico_alvo", e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Grande Área de Conhecimento do CNPq</label>
                        <select
                            className="form-select"
                            value={form.area_conhecimento_cnpq}
                            onChange={(e) => atualizarCampo("area_conhecimento_cnpq", e.target.value)}
                        >
                            <option value="">Selecione</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Área Temática Principal</label>
                        <select
                            className="form-select"
                            value={form.area_tematica_principal}
                            onChange={(e) => atualizarCampo("area_tematica_principal", e.target.value)}
                        >
                            <option value="">Selecione</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Área Temática Secundária</label>
                        <select
                            className="form-select"
                            value={form.area_tematica_secundaria}
                            onChange={(e) => atualizarCampo("area_tematica_secundaria", e.target.value)}
                        >
                            <option value="">Selecione</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Linha de Extensão</label>
                        <select
                            className="form-select"
                            value={form.linha_extensao}
                            onChange={(e) => atualizarCampo("linha_extensao", e.target.value)}
                        >
                            <option value="">Selecione</option>
                        </select>
                    </div>

                    </fieldset>
                )}


                {abaAtiva === "descricao" && (
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
                )}

                {abaAtiva === "plano-de-trabalho" && (

                    <fieldset>
                        <legend>Plano de Trabalho</legend>

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
                )}

                {abaAtiva === "unidades-envolvidas" && (
                    <UnidadesEnvolvidas
                        unidades={unidades}
                        departamentos={departamentos}
                        valor={form.unidadesEnvolvidas}
                        onChange={(linhas) => atualizarCampo("unidadesEnvolvidas", linhas)}
                    />
                )}

                {abaAtiva==="parcerias-internas" && (
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

                )}

                {/* As abas ficam escondidas, não desmontadas, pra não perder as
                    linhas nem recarregar o dropdown ao trocar de aba. */}
                <div hidden={abaAtiva !== "locais-realizacao"}>
                    <LocaisRealizacao
                        valor={form.locaisRealizacao}
                        onChange={(linhas) => atualizarCampo("locaisRealizacao", linhas)}
                    />
                </div>

                <div hidden={abaAtiva !== "membros-equipe"}>
                    <MembrosEquipe
                        coordenador={form.coordenador}
                        valor={form.membrosEquipe}
                        onChange={(linhas) => atualizarCampo("membrosEquipe", linhas)}
                    />
                </div>
            </div>

        </div>
    );
}

export default CadastrarProjeto;