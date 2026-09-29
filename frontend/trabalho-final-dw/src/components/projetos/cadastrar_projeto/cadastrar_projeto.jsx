import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';

import LocaisRealizacao from './abas/LocaisRealizacao';
import MembrosEquipe from './abas/MembrosEquipe';
import UnidadesEnvolvidas from './abas/UnidadesEnvolvidas';
import Identificacao from './abas/Identificacao';
import Caracterizacao from './abas/Caracterizacao';
import Descricao from './abas/Descricao';
import PlanoTrabalho from './abas/PlanoTrabalho';
import ParceriasInternas from './abas/ParceriasInternas';

import { MUNICIPIOS_RJ } from '../../../dados/municipiosRJ';
import { useUnidades } from '../../../hooks/useUnidades';
import { useDepartamentos } from '../../../hooks/useDepartamentos';
import { useVinculosCoordenador } from '../../../hooks/useVinculosCoordenador';
import { useNaturezas } from '../../../hooks/useNaturezas';
import { useAreasCNPQ } from '../../../hooks/useAreasCNPQ';

import { criarProjeto, atualizarEndereco } from '../../../services/projetoService';

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
    const navigate = useNavigate();

    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const token = useAuthStore((state) => state.token);
    
    const [abaAtiva, setAbaAtiva] = useState("identificacao");

    const [buscandoCep, setBuscandoCep] = useState(false);
    const [avisoCep, setAvisoCep] = useState(null);

    // Hooks para carregar dados dos dominios e vinculos do coordenador
    const { dados: unidades, loading: carregandoUnidades, erro: erroUnidades } = useUnidades();
    const { dados: departamentos, loading: carregandoDepartamentos, erro: erroDepartamentos } = useDepartamentos();
    const { dados: vinculosCoordenador, loading: carregandoVinculos, erro: erroVinculos } = useVinculosCoordenador();
    const { dados: naturezas, loading: carregandoNaturezas, erro: erroNaturezas } = useNaturezas();
    const { dados: areasCNPQ, loading: carregandoAreasCNPQ, erro: erroAreasCNPQ } = useAreasCNPQ();

    //projetoId é UUID vindo do POST; as abas tambem usam
    const [projetoId, setProjetoId] = useState(null);
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

    // Essa função é responsável por persistir os dados
    async function salvarDadosIdentificacao() {
        //json projeto pronto com os dados mínimos de um projeto para enviar ao backend
        const projeto = {
            ano: new Date().getFullYear(),
            titulo: form.titulo,
            coordenador: form.coordenador_vinculo, //pega o UUID do vínculo, não a matricula do coordenador e nem o UUID do coordenador. Um bom tempo foi gasto pra perceber isso
            unidade_proponente: form.unidade ? Number(form.unidade) : null,
            departamento_proponente: form.departamento ? Number(form.departamento) : null,
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

        //console.group('Aba Identificação - dados a enviar para o servidor');
        //console.log('POST /api/v1/projetos/', projeto);
        //console.log('PATCH /api/v1/projetos/{id}/endereco/', endereco);
        //console.log('corpo do POST (JSON):', JSON.stringify(projeto));
        //console.log('corpo do PATCH endereco (JSON):', JSON.stringify(endereco));
        //console.groupEnd();
        
        setEnviando(true);
        setErroEnvio(null);
        try {
            let id = projetoId;
            if (!id) {
                id = await criarProjeto(projeto);
                setProjetoId(id);
            }

            // Endereco foi criado vazio pelo backend
            await atualizarEndereco(id, endereco);
            navigate("/Projetos/SeusProjetos");
        } catch (erro) {
            const detalhe = erro.response?.data;
            setErroEnvio(detalhe
                ? Object.values(detalhe).flat().join(' ')
                : 'Nao foi possivel salvar a identificacao.');
        } finally {
            setEnviando(false);
        }
    }

    // Se houver apenas um vínculo ativo, preenche automaticamente o coordenador
    useEffect(() => {
        if (vinculosCoordenador.length === 1) {
            atualizarCampo('coordenador_vinculo', vinculosCoordenador[0].id);
            atualizarCampo('matricula_coordenador', vinculosCoordenador[0].matricula ?? '');
            atualizarCampo('coordenador', vinculosCoordenador[0].nome_completo);
        }
    }, [vinculosCoordenador]);
    
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
            
            <div className="p-3 border rounded bg-body-tertiary">
                
                {abaAtiva === "identificacao" && (
                    <Identificacao
                        form={form}
                        atualizarCampo={atualizarCampo}
                        vinculosCoordenador={vinculosCoordenador}
                        unidades={unidades}
                        departamentos={departamentos}
                        buscarCep={buscarCep}
                        buscandoCep={buscandoCep}
                        avisoCep={avisoCep}
                    />
                )}

                {abaAtiva === "caracterizacao" && (
                    <Caracterizacao
                        form={form}
                        atualizarCampo={atualizarCampo}
                        naturezas={naturezas}
                        carregandoNaturezas={carregandoNaturezas}
                        erroNaturezas={erroNaturezas}
                        areasCNPQ={areasCNPQ}
                        carregandoAreasCNPQ={carregandoAreasCNPQ}
                        erroAreasCNPQ={erroAreasCNPQ}
                        
                    />
                )}


                {abaAtiva === "descricao" && (
                    <Descricao
                        form={form}
                        atualizarCampo={atualizarCampo}
                    />
                )}

                {abaAtiva === "plano-de-trabalho" && (
                    <PlanoTrabalho
                        form={form}
                        atualizarCampo={atualizarCampo}
                    />
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
                    <ParceriasInternas
                        form={form}
                        atualizarCampo={atualizarCampo}
                        unidades={unidades}
                        departamentos={departamentos}
                    />
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
                    onClick={salvarDadosIdentificacao}
                    disabled={enviando}
                >
                    Enviar Formulário
                </button>
            </div>

        </div>
    );
}

export default CadastrarProjeto;
