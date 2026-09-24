import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import LocaisRealizacao from './abas/LocaisRealizacao';
import MembrosEquipe from './abas/MembrosEquipe';

const ABAS = [
    {id: "identificacao", label: "Identificação"},
    {id: "caracterizacao", label: "Caracterização"},
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
        area: "",
        publicoAlvo: "",
        // Abas com várias linhas: cada uma entrega a lista pronta pelo onChange.
        unidade: "", //A unidade selecionada
        departamento: "", //O departamento selecionado
        locaisRealizacao: [],
        membrosEquipe: [],
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
                        <label className="form-label">Público-alvo</label>
                        <input
                        type="text"
                        className="form-control"
                        value={form.publicoAlvo}
                        onChange={(e) => atualizarCampo("publicoAlvo", e.target.value)}
                        />
                    </div>
                    </fieldset>
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