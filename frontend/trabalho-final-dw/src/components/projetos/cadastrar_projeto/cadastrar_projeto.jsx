import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import CampoTextoLongo from './CampoTextoLongo';
import LocaisRealizacao from './abas/LocaisRealizacao';
import MembrosEquipe from './abas/MembrosEquipe';
import UnidadesEnvolvidas from './abas/UnidadesEnvolvidas';
import api from '../../../services/api';//
import { MUNICIPIOS_RJ } from '../../../dados/municipiosRJ';

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

    const [buscandoCep, setBuscandoCep] = useState(false);
    const [avisoCep, setAvisoCep] = useState(null);//recado do ViaCEP quando o CEP não serve

    const [unidades, setUnidades] = useState([]); //Aqui serão armazenadas as unidades que serão obtidas da API para o dropdown
    const [departamentos, setDepartamentos] = useState([]); //Aqui serão armazenados os departamentos que serão obtidas da API para o dropdown
    
    const [vinculosCoordenador, setVinculosCoordenador] = useState([]);//
    const [carregandoVinculos, setCarregandoVinculos] = useState(true);//
    const [erroVinculos, setErroVinculos] = useState(null);//


    const [projetoId, setProjetoId] = useState(null);//UUID vindo do POST; as abas tambem usam
    const [enviando, setEnviando] = useState(false);
    const [erroEnvio, setErroEnvio] = useState(null);
    
    const [form, setForm] = useState({
        //identificação
        titulo: "",
        coordenador: "",
        matricula_coordenador: "",
        coordenador_vinculo: "",
        //endereço
        cep: "",
        logradouro: "",
        municipio: "",
        bairro: "",
        complemento: "",
        numero: "",
        //caracterização
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
        //descrição
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
        //plano de trabalho
        resultados_esperados: "",
        cronograma_atividades: "",
        //unidade envolvidas
        unidade: "",
        departamento: "",
        locaisRealizacao: [],
        membrosEquipe: [],
        unidadesEnvolvidas: [],
    });

    const buscarCep = async (cep) => {
        const digits = cep.replace(/\D/g, '');
        if (digits.length !== 8) return;
        setBuscandoCep(true);
        setAvisoCep(null);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            const data = await res.json();
            if (data.erro) {
                setAvisoCep('CEP não encontrado.');
                return;
            }
            const codigo = Number(data.ibge);
            const municipioDoRio = MUNICIPIOS_RJ.some((m) => m.codigo === codigo);
            if (!municipioDoRio) {
                setAvisoCep(data.localidade
                    ? `O CEP ${digits} é de ${data.localidade}/${data.uf}, fora dos municípios do RJ.`
                    : 'O CEP não corresponde a um município do RJ.');
            }
            setForm(f => ({
                ...f,
                municipio: municipioDoRio ? String(codigo) : '',
                bairro: data.bairro || f.bairro,
                logradouro: data.logradouro || f.logradouro,
            }));
        } catch {
            /* silent */
        } finally {
            setBuscandoCep(false);
        }
    };

    function atualizarCampo(campo, valor) {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    }

    // Mais tarde essa função vai ser responsável por persistir os dados
    async function salvarDadosIdentificacao() {
        //json projeto pronto para enviar para o backend
        const projeto = {
            ano: new Date().getFullYear(),//pega o ano atual
            titulo: form.titulo,//pega o título do formulário
            coordenador: form.coordenador_vinculo, //pega o UUID do vínculo, não a matricula do coordenador e nem o UUID do coordenador. Um bom tempo foi gasto pra perceber isso
            unidade_proponente: form.unidade ? Number(form.unidade) : null,//pega o id da unidade
            departamento_proponente: form.departamento ? Number(form.departamento) : null,//pega o id do departamento
        };


        //json endereço pronto para enviar para o backend
        const endereco = {
            cep: form.cep,
            logradouro: form.logradouro,
            numero: form.numero,
            complemento: form.complemento,
            bairro: form.bairro,
            municipio: form.municipio ? Number(form.municipio) : null, // codigo_ibge (inteiro), vem do dropdown que pode ou não ser movimentado pela requisição ao viaCEP
        };

        //console.group('Aba Identificação — dados a enviar para o servidor');
        //console.log('POST /api/v1/projetos/', projeto);
        //console.log('PATCH /api/v1/projetos/{id}/endereco/', endereco);
        //console.log('corpo do POST (JSON):', JSON.stringify(projeto));
        //console.log('corpo do PATCH endereco (JSON):', JSON.stringify(endereco));
        //console.groupEnd();
        
        setEnviando(true);
        setErroEnvio(null);
        try {
            let id = projetoId; //O id virá no corpo da resposta.
            if (!id) {
                const resposta = await api.post('/projetos/', projeto);
                id = resposta.data.id;
                setProjetoId(id);//guarda: as abas e o proximo salvar dependem dele
            }

            // Endereco foi criado vazio pelo backend
            await api.patch(`/projetos/${id}/endereco/`, endereco);
        } catch (erro) {
            const detalhe = erro.response?.data;
            setErroEnvio(detalhe
                ? Object.values(detalhe).flat().join(' ')
                : 'Nao foi possivel salvar a identificacao.');
        } finally {
            setEnviando(false);
        }
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
        async function carregarVinculos() {
                 try {
                     const perfil = await api.get('/auth/me/');//consulta dados do usuário logado
                     const resposta = await api.get('/dominios/vinculos/');//consulta todos os vinculos
                     const meus = resposta.data.filter(
                         (v) => v.pessoa === perfil.data.id && v.status === 'ATIVO'//filtra os vinculos que são apenas do usuário logado
                     );
                     setVinculosCoordenador(meus);

                     if (meus.length === 1) {//se o usuário só tem uma matricula, então já preenche 
                         atualizarCampo('coordenador_vinculo', meus[0].id);
                         atualizarCampo('matricula_coordenador', meus[0].matricula ?? '');
                         atualizarCampo('coordenador', meus[0].nome_completo);
                     }
                 } catch (erro) {
                     console.error('Erro ao carregar vínculos:', erro);
                     setErroVinculos('Não foi possível carregar as matrículas');
                 } finally {
                     setCarregandoVinculos(false);
                 }
             }
        carregarVinculos();
        carregarUnidades();
        carregarDepartamentos();
    }, []);
    
    return (
        <div className="container mt-4">
            {/* Mesma ideia da lista: o titulo fica so para leitor de tela,
                porque as abas logo abaixo ja dizem onde a pessoa esta. */}
            <h1 className="visually-hidden">Cadastro de projeto</h1>

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
            
            <div className="p-3 border rounded bg-body-tertiary">
                
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
                                            {v.matricula || 'sem matrícula'} — {v.tipo_vinculo_display}
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

                )}

                {abaAtiva === "caracterizacao" && (
                    <fieldset>
                    <legend>
                        Caracterização
                    </legend>
                    
                    <div className="mb-3">
                        <label className="form-label">Situação do Projeto</label>
                        <input
                        type="text"
                        className="form-control"
                        value="Novo"
                        readonly
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
                            campo="objetivo_especifico"
                            limite={1000}
                            linhas={4}
                            valor={form.objetivo_especifico}
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
                        campo="interdisciplinaridade_interprofissionalidade"
                        limite={1000}
                        linhas={4}
                        valor={form.interdisciplinaridade_interprofissionalidade}
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
                        campo="impacto_transformacao_social"
                        limite={1000}
                        linhas={4}
                        valor={form.impacto_transformacao_social}
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
                )}

                {abaAtiva === "plano-de-trabalho" && (

                    <fieldset>
                        <legend>Plano de Trabalho</legend>

                                                <CampoTextoLongo
                            rotulo="Resultados esperados para o biênio"
                            campo="resultados_esperados"
                            limite={1000}
                            linhas={5}
                            valor={form.resultados_esperados}
                            aoMudar={atualizarCampo}
                        />

                                                <CampoTextoLongo
                            rotulo="Cronograma de atividades do biênio"
                            campo="cronograma_atividades"
                            limite={1000}
                            linhas={5}
                            valor={form.cronograma_atividades}
                            aoMudar={atualizarCampo}
                        />

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
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={salvarDadosIdentificacao} //só pra testra
                >
                    Enviar formulário 
                </button> 
            </div>

        </div>
    );
}

export default CadastrarProjeto;