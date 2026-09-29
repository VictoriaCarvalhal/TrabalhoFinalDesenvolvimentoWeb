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
import { useAreasTematicas } from '../../../hooks/useAreasTematicas';
import { useLinhasExtensao } from '../../../hooks/useLinhasExtensao';


import { 
    criarProjeto,
    atualizarEndereco,
    criarContato,
    atualizarCaracterizacao,
    atualizarDescricao,
    criarPlanoDeTrabalho
} from '../../../services/projetoService';

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
    const { dados: areasTematicas, loading: carregandoAreasTematicas, erro: erroAreasTematicas } = useAreasTematicas();
    const { dados: linhasExtensao, loading: carregandoLinhasExtensao, erro: erroLinhasExtensao } = useLinhasExtensao();
    

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
        //contato: sempre começa com um campo de cada, o botão + acrescenta mais
        telefones: [""],
        emails: [""],
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
        objetivo_geral: "",
        objetivos_especificos: "",
        metodologia_avaliacao: "",
        relacao_ensino: "",
        relacao_pesquisa: "",
        interacao_dialogica: "",
        interdisciplinaridade: "",
        impacto_formacao: "",
        indissociabilidade: "",
        impacto_social: "",
        referencias_bibliograficas: "",
        //plano de trabalho
        resultados_esperados: "",
        cronograma_atividades: "",
        //parcerias internas
        participacao_interna: "",
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

        //json caracterizacao pronto para enviar para o backend
        const caracterizacao = {
            situacao_academica: "NOVO", //no backend bem que podia ser NOVO por default
            vinculado_programa_extensao: form.vinculado_extensao === "sim",
            curricularizado: form.curricular === "sim",
            natureza: form.natureza || null,
            abrangencia: form.abrangencia || null,
            publico_alvo: form.publico_alvo,
            grande_area_cnpq: form.area_conhecimento_cnpq || null,
            area_tematica_principal: form.area_tematica_principal || null,
            area_tematica_secundaria: form.area_tematica_secundaria || null,
            linha_extensao: form.linha_extensao || null,
        };

        //json descricao pronto para enviar para o backend
        const descricao = {
            resumo: form.resumo || null,
            palavras_chave: [form.palavra_chave_1, form.palavra_chave_2, form.palavra_chave_3].filter(Boolean),
            introducao: form.introducao || null,
            justificativa: form.justificativa || null,
            objetivo_geral: form.objetivo_geral || null,
            objetivos_especificos: form.objetivos_especificos || null,
            metodologia_avaliacao: form.metodologia_avaliacao || null,
            relacao_ensino: form.relacao_ensino === "sim",
            relacao_pesquisa: form.relacao_pesquisa === "sim",
            interacao_dialogica: form.interacao_dialogica || null,
            interdisciplinaridade: form.interdisciplinaridade || null,
            impacto_formacao: form.impacto_formacao || null,
            indissociabilidade: form.indissociabilidade || null,
            impacto_social: form.impacto_social || null,
            referencias_bibliograficas: form.referencias_bibliograficas || null,
        };

        //json plano_trabalho pronto para enviar para o backend
        const plano_trabalho = {
            "ano": new Date().getFullYear(),
            "resultados_esperados": form.resultados_esperados,
            "cronograma_atividades": form.cronograma_atividades
        };

        setEnviando(true);
        setErroEnvio(null);
        try {
            let projeto_id = projetoId;
            if (!projeto_id) {
                projeto_id = await criarProjeto(projeto);
                setProjetoId(projeto_id);
            }

            // Endereco, Caracterizacao e Descrição foram criados vazio pelo backend
            await atualizarEndereco(projeto_id, endereco);
            await atualizarCaracterizacao(projeto_id, caracterizacao);
            await atualizarDescricao(projeto_id, descricao);

            // Plano de trabalho e contatos não
            await criarPlanoDeTrabalho(projeto_id, plano_trabalho);
            const contatos = [
                ...form.telefones.map((valor) => ({ tipo_contato: 'TELEFONE', valor: valor.trim() })),
                ...form.emails.map((valor) => ({ tipo_contato: 'EMAIL', valor: valor.trim() })),
            ].filter((c) => c.valor);

            for (const contato of contatos) {
                await criarContato(projeto_id, contato);
            }
            
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
                        areasTematicas={areasTematicas}
                        carregandoAreasTematicas={carregandoAreasTematicas}
                        erroAreasTematicas={erroAreasTematicas}
                        linhasExtensao={linhasExtensao}
                        carregandoLinhasExtensao={carregandoLinhasExtensao}
                        erroLinhasExtensao={erroLinhasExtensao}
                        
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
