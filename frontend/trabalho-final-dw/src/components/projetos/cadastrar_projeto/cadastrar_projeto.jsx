import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';

{/*Adicione aqui novas abas do formulário*/}
const ABAS = [
    {id: "identificacao", label: "Identificação"},
    {id: "caracterizacao", label: "Caracterização"},
    {id: "descricao", label: "Descrição"},
    {id: "plano-de-trabalho", label: "Plano de Trabalho"},
    {id: "unidades-envolvidas", label: "Unidades Envolvidas"},
    {id: "locais-de-realizacao", label: "Locais de Realização"},
    {id: "parcerias-internas", label: "Parcerias Internas"},
];

function CadastrarProjeto() {
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const token = useAuthStore((state) => state.token);

    const [abaAtiva, setAbaAtiva] = useState("identificacao");

    {/*Adicione aqui os items do formulario para que eles sejam salvos temporariamente*/}
    const [form, setForm] = useState({
        titulo: "",
        coordenador: "",
        area: "",
        publicoAlvo: "",
    });

    function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    }


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
                
                {/*----------ABA DE IDENTIFICAÇÃO----------*/}
                
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
                                <input type="number" className="form-control"/>
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
                            <legend>Contato</legend>

                                <div className="mb-3">
                                    <label className="form-label">E-mail</label>
                                    
                                    <input type="text"
                                    className="form-control"
                                    value={form.email}
                                    onChange={(e) => atualizarCampo("email", e.target.value)}
                                    />
                                    
                        
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Telefone</label>
                                    
                                    <input type="tel"
                                    className="form-control"
                                    value={form.telefone}
                                    onChange={(e) => atualizarCampo("telefone", e.target.value)}
                                    />
                                    
                        
                                </div>

                        </fieldset>

                        <fieldset className="border rounded p-3 m-2">
                            <legend>Endereço</legend>

                        </fieldset>
                    </fieldset>
                )}

                {/*----------ABA DE IDENTIFICAÇÃO----------*/}

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
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault1">
                                Sim
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault1">
                                Não
                            </label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">É curricular?</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault1">
                                Sim
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault2">
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
                        onChange={(e) => atualizarCampo("abragencia", e.target.value)}
                        >

                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Público Alvo</label>
                                <textarea class="form-control">
                                </textarea>    
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Grande Área de Conhecimento do CNPq</label>
                                    
                        <select 
                        className="form-select"
                        value={form.unidade}
                        onChange={(e) => atualizarCampo("unidade", e.target.value)}
                        >

                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Área Temática Principal</label>
                                    
                        <select 
                        className="form-select"
                        value={form.unidade}
                        onChange={(e) => atualizarCampo("unidade", e.target.value)}
                        >

                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Área Temática Secundária</label>
                                    
                        <select 
                        className="form-select"
                        value={form.unidade}
                        onChange={(e) => atualizarCampo("unidade", e.target.value)}
                        >

                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Linha de Extensão</label>
                                    
                        <select 
                        className="form-select"
                        value={form.unidade}
                        onChange={(e) => atualizarCampo("unidade", e.target.value)}
                        >

                        </select>
                    </div>

                    </fieldset>
                )}

                {/*----------ABA DE DESCRIÇÃO----------*/}

                {abaAtiva === "descricao" && (
                    <fieldset>
                        <legend>Descrição</legend>
                        <div className="mb-3">
                            <label className="form-label">Resumo (no máximo 
                                2000 caracteres)
                            </label>
                                    <textarea class="form-control" maxlength="2000">
                                    </textarea>    
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">Palavra Chave 1</label>
                            <input type="text" className="form-control"/>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Palavra Chave 2</label>
                            <input type="text" className="form-control"/>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Palavra Chave 3</label>
                            <input type="text" className="form-control"/>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Introdução (no máximo
                                3000 caracteres)
                            </label>
                                    <textarea class="form-control" maxlength="3000">
                                    </textarea>    
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Justificativa (no máximo 
                                2000 caracteres)
                            </label>
                                    <textarea class="form-control" maxlength="2000">
                                    </textarea>    
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Objetivo Geral (no máximo 
                                500 caracteres)
                            </label>
                                    <textarea class="form-control" maxlength="500">
                                    </textarea>    
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Objetivos Específicos (no máximo 
                                1000 caracteres)
                            </label>
                                    <textarea class="form-control" maxlength="1000">
                                    </textarea>    
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Metodologia e Avaliação (no máximo 
                                2000 caracteres)
                            </label>
                                    <textarea class="form-control" maxlength="2000">
                                    </textarea>    
                        </div>

                    <div className="mb-3">
                        <label className="form-label">Tem relação com ensino?</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault1">
                                Sim
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault2">
                                Não
                            </label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Tem relação com Pesquisa?</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault1">
                                Sim
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1"/>
                            <label class="form-check-label" for="flexRadioDefault2">
                                Não
                            </label>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Interação Dialógica (no máximo 
                            1000 caracteres)
                        </label>
                            <textarea class="form-control" maxlength="1000">
                            </textarea>    
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Interdisciplinaridade e Interprofissionalidade (no máximo 
                            1000 caracteres)
                        </label>
                            <textarea class="form-control" maxlength="1000">
                            </textarea>    
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Impacto na Formação do Estudante (no máximo 
                            1000 caracteres)
                        </label>
                            <textarea class="form-control" maxlength="1000">
                            </textarea>    
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Indissociabilidade Ensino - Pesquisa - Extensão (no máximo 
                            1000 caracteres)
                        </label>
                            <textarea class="form-control" maxlength="1000">
                            </textarea>    
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Impacto e Transformação Social (no máximo 
                            1000 caracteres)
                        </label>
                            <textarea class="form-control" maxlength="1000">
                            </textarea>    
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Referências Bibliográficas (no máximo 
                            1000 caracteres)
                        </label>
                            <textarea class="form-control" maxlength="1000">
                            </textarea>    
                    </div>

                    </fieldset>
                )}

                {/*----------ABA DE PLANO DE TRABALHO----------*/}

                {abaAtiva === "plano-de-trabalho" && (

                    <fieldset>
                        <legend>Plano de Trabalho</legend>

                        <div className="mb-3">
                            <label className="form-label">Resultados esperados para o biênio (no máximo 
                                1000 caracteres)
                            </label>
                                <textarea class="form-control" maxlength="1000">
                                </textarea>    
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Cronograma de atividades do biênio (no máximo 
                                1000 caracteres)
                            </label>
                                <textarea class="form-control" maxlength="1000">
                                </textarea>    
                        </div>

                    </fieldset>
                )}

                {/*----------ABA DE UNIDADES ENVOLVIDAS----------*/}


                {/*----------ABA DE LOCAIS DE REALIZAÇÃO----------*/}


                {/*----------ABA DE PARCERIAS INTERNAS----------*/}
                
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
                            <select className="form-select">
                                <option></option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Departamento</label><br/>
                            <select className="form-select">
                                <option></option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Participação (no máximo 500 caracteres)</label><br/>
                            <textarea className="form-control" maxlength="500" cols="35"/>
                        </div>


                    </fieldset>

                )}
            </div>
            <div className="mt-4 p-3 border rounded bg-light">
                <h4 className="text-primary">Status do Zustand (Mock):</h4>
                <p>
                    <strong>Usuário logado? </strong>
                    {isAutenticado ? "Sim 🟢" : "Não 🔴"}
                </p>
                <p>
                    <strong>Token salvo: </strong>
                    {token ? token : "Nenhum token encontrado"}
                </p>
            </div>
        </div>
    );
}

export default CadastrarProjeto;