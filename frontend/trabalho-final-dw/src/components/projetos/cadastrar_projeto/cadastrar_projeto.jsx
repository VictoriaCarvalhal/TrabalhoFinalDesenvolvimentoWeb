import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import api from '../../../services/api';

import LocaisRealizacao from './abas/LocaisRealizacao';
import MembrosEquipe from './abas/MembrosEquipe';
import UnidadesEnvolvidas from './abas/UnidadesEnvolvidas';
import Identificacao from './abas/Identificacao';
import Caracterizacao from './abas/Caracterizacao';
import Descricao from './abas/Descricao';
import PlanoTrabalho from './abas/PlanoTrabalho';
import Parcerias from './abas/Parcerias';
import DemandasBolsa from './abas/DemandasBolsa';

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
    criarPalavraChave,
    excluirPalavraChave,
    atualizarProjeto,
    atualizarEndereco,
    atualizarCaracterizacao,
    atualizarDescricao,
    criarPlanoDeTrabalho,
    atualizarPlanoDeTrabalho,
    criarContato,
    excluirContato
} from '../../../services/projetoService';

const ABAS = [
    { id: "identificacao", label: "Identificação" },
    { id: "caracterizacao", label: "Caracterização" },
    { id: "descricao", label: "Descrição" },
    { id: "plano-de-trabalho", label: "Plano de Trabalho" },
    { id: "unidades-envolvidas", label: "Unidades Envolvidas" },
    { id: "parcerias", label: "Parcerias" },
    { id: "demandas-bolsa", label: "Demanda de Bolsa" },
    { id: "locais-realizacao", label: "Locais de Realização" },
    { id: "membros-equipe", label: "Membros da Equipe" },
];


function CadastrarProjeto() {
    const navigate = useNavigate();
    // Rota :id/editar reusa esta tela: com id na URL vira modo edição.
    const { id: idDaUrl } = useParams();
    const editando = Boolean(idDaUrl);

    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const token = useAuthStore((state) => state.token);

    const [etapaAtual, setEtapaAtual] = useState(0);
    const [errosValidacao, setErrosValidacao] = useState({});

    function validarEtapa0(f) {
           const erros = {};
           if (!f.titulo.trim()) erros.titulo = "Título é obrigatório";
           if (!f.coordenador_vinculo) erros.coordenador_vinculo = "Selecione uma matrícula";
           if (!f.unidade) erros.unidade = "Selecione uma unidade";
           // Unidade sem departamento cadastrado nao tem o que escolher,
           // entao o campo fica como "Nao se aplica" e nao e cobrado.
           const temDepartamento = departamentos.some(
               (d) => String(d.unidade) === String(f.unidade));
           if (temDepartamento && !f.departamento) erros.departamento = "Selecione um departamento";
           if (!f.telefones[0]?.trim()) erros.telefones = "Telefone é obrigatório";
           if (!f.emails[0]?.trim()) erros.emails = "E-mail é obrigatório";
           if (!f.cep.trim()) erros.cep = "CEP é obrigatório";
           if (!f.logradouro.trim()) erros.logradouro = "Logradouro é obrigatório";
           if (!f.bairro.trim()) erros.bairro = "Bairro é obrigatório";
           if (!f.municipio) erros.municipio = "Selecione um município";
           if (!f.numero.trim()) erros.numero = "Número é obrigatório";
           return erros;
    }

    function validarEtapa1(f) {
           const erros = {};
           if (!f.vinculado_extensao) erros.vinculado_extensao = "Selecione uma opção";
           if (!f.curricular) erros.curricular = "Selecione uma opção";
           if (!f.natureza) erros.natureza = "Selecione uma natureza";
           if (!f.abrangencia) erros.abrangencia = "Selecione uma abrangência";
           if (!f.publico_alvo.trim()) erros.publico_alvo = "Público alvo é obrigatório";
           if (!f.area_conhecimento_cnpq) erros.area_conhecimento_cnpq = "Selecione uma área";
           if (!f.area_tematica_principal) erros.area_tematica_principal = "Selecione uma área temática";
           if (!f.area_tematica_secundaria) erros.area_tematica_secundaria = "Selecione uma área temática";
           if (!f.linha_extensao) erros.linha_extensao = "Selecione uma linha de extensão";
           return erros;
    }

    function validarEtapa2(f) {
           const erros = {};
           if (!f.resumo.trim()) erros.resumo = "Resumo é obrigatório";
           if (!f.palavras_chave[0]?.trim()) erros.palavras_chave = "Adicione pelo menos 1 palavra-chave";
           if (!f.introducao.trim()) erros.introducao = "Introdução é obrigatória";
           if (!f.justificativa.trim()) erros.justificativa = "Justificativa é obrigatória";
           if (!f.objetivo_geral.trim()) erros.objetivo_geral = "Objetivo geral é obrigatório";
           if (!f.objetivos_especificos.trim()) erros.objetivos_especificos = "Objetivos específicos são obrigatórios";
           if (!f.metodologia_avaliacao.trim()) erros.metodologia_avaliacao = "Metodologia é obrigatória";
           if (!f.relacao_ensino) erros.relacao_ensino = "Selecione uma opção";
           if (!f.relacao_pesquisa) erros.relacao_pesquisa = "Selecione uma opção";
           if (!f.interacao_dialogica.trim()) erros.interacao_dialogica = "Interação dialógica é obrigatória";
           if (!f.interdisciplinaridade.trim()) erros.interdisciplinaridade = "Interdisciplinaridade é obrigatória";
           if (!f.impacto_formacao.trim()) erros.impacto_formacao = "Impacto na formação é obrigatório";
           if (!f.indissociabilidade.trim()) erros.indissociabilidade = "Indissociabilidade é obrigatória";
           if (!f.impacto_social.trim()) erros.impacto_social = "Impacto social é obrigatório";
           if (!f.referencias_bibliograficas.trim()) erros.referencias_bibliograficas = "Referências são obrigatórias";
           return erros;
    }

    function validarEtapa3(f){
        const erros = {};
        if(!f.resultados_esperados.trim()) erros.resultados_esperados = "Este campo é obrigatório";
        if(!f.cronograma_atividades.trim()) erros.cronograma_atividades = "Este campo é obrigatório";
        return erros;
    }

    function validarEtapa4(f){
        const erros = {};
        if(!(f.unidadesEnvolvidas.length > 0 && f.unidadesEnvolvidas.every(item => item.unidade))) erros.unidadesEnvolvidas = "Adicione pelo menos 1 (uma) Unidade Envolvida";
        return erros;
    }

    function validarEtapa5(f){
        const erros = {};
        if(!(f.parceriasInternas.length > 0 && f.parceriasInternas.every(item => item.nome_instituicao.trim() && item.unidade && item.participacao))) erros.parceriasInternas = "Adicione pelo menos 1 (uma) Parceria Interna";
        if(!(f.parceriasExternas.length > 0 && f.parceriasExternas.every(item => item.nome_instituicao.trim() && item.tipo_instituicao && item.participacao))) erros.parceriasExternas = "Adicione pelo menos 1 (uma) Parceria Externa";
        return erros;
    }

    function validarEtapa6(f){
        const erros = {};
        if(!(f.demandasBolsa.length > 0 && f.demandasBolsa.every(item => item.tipo_bolsa && item.quantidade))) erros.demandasBolsa = "Adicione pelo menos 1 (uma) demanda por bolsa.";
        return erros;
    }

    function validarEtapa7(f){
        const erros = {}
        if(!(f.locaisRealizacao.length > 0 && f.locaisRealizacao.every(item => item.nome_local.trim() && item.municipio))) erros.locaisRealizacao = "Adicione pelo menos 1 (um) Local de Realização";
        return erros;
    }

    function validarEtapa8(f){
        const erros = {};
        if(!(f.membrosEquipe.length > 0 && f.membrosEquipe.every(item => item.matricula && item.funcao))) erros.membrosEquipe = "Adicione pelo menos 1 (um) membro de equipe.";
        return erros;
    }

    function obterErrosEtapa(f = form, indice = etapaAtual) {
           if (indice === 0) return validarEtapa0(f);
           if (indice === 1) return validarEtapa1(f);
           if (indice === 2) return validarEtapa2(f);
           if (indice === 3) return validarEtapa3(f);
           if (indice === 4) return validarEtapa4(f);
           if (indice === 5) return validarEtapa5(f);
           if (indice === 6) return validarEtapa6(f);
           if (indice === 7) return validarEtapa7(f);
           if (indice === 8) return validarEtapa8(f);
           return {};
    }

    // Navegação entre abas é livre: nenhuma validação prende o usuário.
    // A cobrança de campos obrigatórios acontece só no "Enviar projeto"
    // (abrirConfirmacao), conforme as regras de negócio.
    // tentouEnviar marca que já houve uma tentativa: a partir daí as abas
    // com pendência ficam vermelhas e a aba atual mostra os erros dela,
    // sem pular o usuário de lugar.
    function errosParaExibirNaEtapa(indice, f = form) {
        // Antes de qualquer tentativa de envio, não marca nada em vermelho.
        if (!tentouEnviar) return {};
        return obterErrosEtapa(f, indice);
    }

    function proximaEtapa() {
        const proxima = Math.min(etapaAtual + 1, ABAS.length - 1);
        setErrosValidacao(errosParaExibirNaEtapa(proxima));
        setEtapaAtual(proxima);
    }

    function etapaAnterior() {
        const anterior = Math.max(etapaAtual - 1, 0);
        setErrosValidacao(errosParaExibirNaEtapa(anterior));
        setEtapaAtual(anterior);
    }

    // Clicar numa aba leva direto para ela, sem validar nada no caminho.
    function irParaEtapa(indice) {
        if (indice === etapaAtual) return;
        setErrosValidacao(errosParaExibirNaEtapa(indice));
        setEtapaAtual(indice);
    }

    const [confirmando, setConfirmando] = useState(false);
    const [tentouEnviar, setTentouEnviar] = useState(false);
    const resumoRef = useRef(null);
    const conteudoRef = useRef(null);

    // Vai para a aba com pendência e rola até o primeiro campo inválido
    // dela. O duplo rAF espera o React trocar a aba antes de procurar o
    // campo no DOM.
    function irParaAbaComPendencia(indice) {
        setEtapaAtual(indice);
        setErrosValidacao(obterErrosEtapa(form, indice));
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const alvo = conteudoRef.current?.querySelector('.is-invalid');
                if (alvo) {
                    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (typeof alvo.focus === 'function') alvo.focus({ preventScroll: true });
                } else {
                    conteudoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [avisoCep, setAvisoCep] = useState(null);

    // Hooks para carregar dados dos dominios e vinculos do coordenador
    const { dados: unidades, loading: carregandoUnidades, erro: erroUnidades } = useUnidades();
    const { dados: departamentos, loading: carregandoDepartamentos, erro: erroDepartamentos } = useDepartamentos();
    const { dados: vinculosCoordenador, loading: carregandoVinculos, erro: erroVinculos, recarregar: recarregarVinculos } = useVinculosCoordenador();
    const { dados: naturezas, loading: carregandoNaturezas, erro: erroNaturezas } = useNaturezas();
    const { dados: areasCNPQ, loading: carregandoAreasCNPQ, erro: erroAreasCNPQ } = useAreasCNPQ();
    const { dados: areasTematicas, loading: carregandoAreasTematicas, erro: erroAreasTematicas } = useAreasTematicas();
    const { dados: linhasExtensao, loading: carregandoLinhasExtensao, erro: erroLinhasExtensao } = useLinhasExtensao();


    //projetoId é UUID vindo do POST; no modo edição vem da URL
    const [projetoId, setProjetoId] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [erroEnvio, setErroEnvio] = useState(null);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [erroCarregamento, setErroCarregamento] = useState(null);

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
        palavras_chave: [""],
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
        //unidade proponente, da Identificação
        unidade: "",
        departamento: "",
        //abas de tabela
        locaisRealizacao: [],
        membrosEquipe: [],
        unidadesEnvolvidas: [],
        parceriasInternas: [],
        parceriasExternas: [],
        demandasBolsa: [],
    });

    const simNao = (valor) => (valor ? "sim" : "nao");

    useEffect(() => {
        if (!idDaUrl || !isAutenticado) return;
        let cancelado = false;
        setCarregandoEdicao(true);
        setErroCarregamento(null);
        setProjetoId(idDaUrl);

        Promise.all([
            api.get(`/projetos/${idDaUrl}/`),
            api.get(`/projetos/${idDaUrl}/palavras_chave/`),
            api.get(`/projetos/${idDaUrl}/abas/`),
        ])
            .then(([detalheRes, palavrasRes, abasRes]) => {
                if (cancelado) return;
                const d = detalheRes.data;
                const endereco = d.endereco ?? {};
                const carac = d.caracterizacao ?? {};
                const desc = d.descricao ?? {};
                const contatos = Array.isArray(d.contatos) ? d.contatos : [];
                const telefones = contatos
                    .filter((c) => c.tipo_contato === 'TELEFONE')
                    .map((c) => c.valor);
                const emails = contatos
                    .filter((c) => c.tipo_contato === 'EMAIL')
                    .map((c) => c.valor);
                const palavrasDados = palavrasRes.data;
                const palavras = (
                    Array.isArray(palavrasDados) ? palavrasDados : palavrasDados.results ?? []
                ).map((p) => p.palavra);
                const abas = abasRes.data ?? {};
                const plano = (abas.planos_trabalho ?? [])[0] ?? {};

                setForm((prev) => ({
                    ...prev,
                    titulo: d.titulo ?? "",
                    coordenador_vinculo: d.coordenador ? String(d.coordenador) : "",
                    unidade: d.unidade_proponente != null ? String(d.unidade_proponente) : "",
                    departamento: d.departamento_proponente != null ? String(d.departamento_proponente) : "",
                    telefones: telefones.length > 0 ? telefones : [""],
                    emails: emails.length > 0 ? emails : [""],
                    cep: endereco.cep ?? "",
                    logradouro: endereco.logradouro ?? "",
                    municipio: endereco.municipio != null ? String(endereco.municipio) : "",
                    bairro: endereco.bairro ?? "",
                    complemento: endereco.complemento ?? "",
                    numero: endereco.numero ?? "",
                    vinculado_extensao: simNao(carac.vinculado_programa_extensao),
                    curricular: simNao(carac.curricularizado),
                    natureza: carac.natureza != null ? String(carac.natureza) : "",
                    abrangencia: carac.abrangencia ?? "",
                    publico_alvo: carac.publico_alvo ?? "",
                    area_conhecimento_cnpq: carac.grande_area_cnpq != null ? String(carac.grande_area_cnpq) : "",
                    area_tematica_principal: carac.area_tematica_principal != null ? String(carac.area_tematica_principal) : "",
                    area_tematica_secundaria: carac.area_tematica_secundaria != null ? String(carac.area_tematica_secundaria) : "",
                    linha_extensao: carac.linha_extensao != null ? String(carac.linha_extensao) : "",
                    resumo: desc.resumo ?? "",
                    palavras_chave: palavras.length > 0 ? palavras : [""],
                    palavra_chave_1: palavras[0] ?? "",
                    palavra_chave_2: palavras[1] ?? "",
                    palavra_chave_3: palavras[2] ?? "",
                    introducao: desc.introducao ?? "",
                    justificativa: desc.justificativa ?? "",
                    objetivo_geral: desc.objetivo_geral ?? "",
                    objetivos_especificos: desc.objetivos_especificos ?? "",
                    metodologia_avaliacao: desc.metodologia_avaliacao ?? "",
                    relacao_ensino: simNao(desc.relacao_ensino),
                    relacao_pesquisa: simNao(desc.relacao_pesquisa),
                    interacao_dialogica: desc.interacao_dialogica ?? "",
                    interdisciplinaridade: desc.interdisciplinaridade ?? "",
                    impacto_formacao: desc.impacto_formacao ?? "",
                    indissociabilidade: desc.indissociabilidade ?? "",
                    impacto_social: desc.impacto_social ?? "",
                    referencias_bibliograficas: desc.referencias_bibliograficas ?? "",
                    resultados_esperados: plano.resultados_esperados ?? "",
                    cronograma_atividades: plano.cronograma_atividades ?? "",
                    locaisRealizacao: abas.locais_realizacao ?? [],
                    membrosEquipe: abas.membros_equipe ?? [],
                    unidadesEnvolvidas: abas.unidades_envolvidas ?? [],
                    parceriasInternas: abas.parcerias_internas ?? [],
                    parceriasExternas: abas.parcerias_externas ?? [],
                    demandasBolsa: abas.demandas_bolsa ?? [],
                }));
            })
            .catch((e) => {
                if (!cancelado) {
                    setErroCarregamento(
                        e?.response?.status === 404
                            ? 'Projeto não encontrado ou sem acesso.'
                            : 'Erro ao carregar o projeto para edição.'
                    );
                }
            })
            .finally(() => {
                if (!cancelado) setCarregandoEdicao(false);
            });

        return () => { cancelado = true; };
    }, [idDaUrl, isAutenticado]);

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
        setForm((prev) => {
            const atualizado = { ...prev, [campo]: valor };
            // A caixa vermelha some assim que o campo deixa de estar errado.
            // Checa as 3 etapas validadas (não só a atual), porque a
            // navegação é livre e o erro pode ser de outra aba.
            setErrosValidacao((errosAtuais) => {
                if (!errosAtuais[campo]) return errosAtuais;
                const aindaComErro = {
                    ...validarEtapa0(atualizado),
                    ...validarEtapa1(atualizado),
                    ...validarEtapa2(atualizado),
                    ...validarEtapa3(atualizado),
                    ...validarEtapa4(atualizado),
                    ...validarEtapa5(atualizado),
                    ...validarEtapa6(atualizado),
                    ...validarEtapa7(atualizado),
                    ...validarEtapa8(atualizado),
                }[campo];
                if (aindaComErro) return errosAtuais;
                const { [campo]: _corrigido, ...restantes } = errosAtuais;
                return restantes;
            });
            return atualizado;
        });
    }

    // Monta as linhas das abas de tabela. A tela deixa a linha meio
    // preenchida à vontade, então só as completas entram no payload.
    function linhasDeUnidadesEnvolvidas() {
        return form.unidadesEnvolvidas
            .filter((linha) => linha.unidade)
            .map((linha) => ({
                // O departamento da linha é só para filtrar o dropdown: quem
                // guarda o vínculo é ProjetoUnidade, que só tem a unidade.
                unidade: linha.unidade,
            }));
    }

    function linhasDeLocaisRealizacao() {
        return form.locaisRealizacao
            .filter((linha) => linha.nome_local && linha.municipio)
            .map((linha) => ({
                nome_local: linha.nome_local,
                municipio: linha.municipio,
            }));
    }

    function linhasDeMembrosEquipe() {
        return form.membrosEquipe
            .filter((linha) => linha.vinculo && linha.funcao)
            .map((linha) => ({
                vinculo: linha.vinculo,
                funcao: linha.funcao,
            }));
    }


    function linhasDeParceriasInternas() {
        return form.parceriasInternas
            .filter((linha) => linha.unidade && linha.nome_instituicao && linha.sigla_instituicao)
            .map((linha) => ({
                unidade: linha.unidade,
                departamento: linha.departamento || null,
                nome_instituicao: linha.nome_instituicao,
                sigla_instituicao: linha.sigla_instituicao,
                participacao: linha.participacao,
            }));
    }

    function linhasDeDemandasBolsa() {
        return form.demandasBolsa
            .filter((linha) => linha.tipo_bolsa && Number(linha.quantidade) >= 1)
            .map((linha) => ({
                tipo_bolsa: linha.tipo_bolsa,
                quantidade: Number(linha.quantidade),
                justificativa: linha.justificativa ?? '',
            }));
    }

    function linhasDeParceriasExternas() {
        return form.parceriasExternas
            .filter((linha) => linha.nome_instituicao && linha.tipo_instituicao)
            .map((linha) => ({
                nome_instituicao: linha.nome_instituicao,
                sigla_instituicao: linha.sigla_instituicao,
                tipo_instituicao: linha.tipo_instituicao,
                participacao: linha.participacao,
            }));
    }

    // Essa função é responsável por persistir os dados de todas as abas em 1 única chamada atômica
    // Antes de enviar, confere as tres etapas que tem campo obrigatorio e
    // mostra o que falta. So abre a confirmacao se estiver tudo certo.
    // Não pula de aba: marca as abas com pendência de vermelho, mostra os
    // erros da aba atual e rola até o resumo no topo.
    function abrirConfirmacao() {
        setTentouEnviar(true);
        const faltando = [
            { indice: 0, nome: ABAS[0].label, erros: validarEtapa0(form) },
            { indice: 1, nome: ABAS[1].label, erros: validarEtapa1(form) },
            { indice: 2, nome: ABAS[2].label, erros: validarEtapa2(form) },
            { indice: 3, nome: ABAS[3].label, erros: validarEtapa3(form) },
            { indice: 4, nome: ABAS[4].label, erros: validarEtapa4(form) },
            { indice: 5, nome: ABAS[5].label, erros: validarEtapa5(form) },
            { indice: 6, nome: ABAS[6].label, erros: validarEtapa6(form) },
            { indice: 7, nome: ABAS[7].label, erros: validarEtapa7(form) },
            { indice: 8, nome: ABAS[8].label, erros: validarEtapa8(form) },
        ].filter((etapa) => Object.keys(etapa.erros).length > 0);

        if (faltando.length > 0) {
            // mostra os erros da aba onde o usuário está, sem tirá-lo dela
            setErrosValidacao(obterErrosEtapa(form, etapaAtual));
            requestAnimationFrame(() => {
                resumoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                resumoRef.current?.focus({ preventScroll: true });
            });
            return;
        }

        setConfirmando(true);
    }

    // Contagem viva de erros por aba (recalculada a cada render): alimenta
    // tanto as abas vermelhas quanto o resumo do topo. Só aparece depois da
    // primeira tentativa de envio.
    const errosPorAba = tentouEnviar
        ? [validarEtapa0(form), validarEtapa1(form), validarEtapa2(form), validarEtapa3(form), validarEtapa4(form), validarEtapa5(form), validarEtapa6(form), validarEtapa7(form), validarEtapa8(form)]
        : [{}, {}, {}, {}, {}, {}, {}, {}];
    const totalPendencias = errosPorAba.reduce(
        (total, erros) => total + Object.keys(erros).length, 0);

    async function salvarDadosIdentificacao() {
        const enderecoDados = {
            cep: form.cep,
            logradouro: form.logradouro,
            numero: form.numero,
            complemento: form.complemento,
            bairro: form.bairro,
            municipio: form.municipio ? Number(form.municipio) : null,
        };
        const contatosDados = [
            ...form.telefones.map((valor) => ({ tipo_contato: 'TELEFONE', valor: valor.trim() })),
            ...form.emails.map((valor) => ({ tipo_contato: 'EMAIL', valor: valor.trim() })),
        ].filter((c) => c.valor);
        const caracterizacaoDados = {
            situacao_academica: "NOVO", //no backend bem que podia ser NOVO por default
            vinculado_programa_extensao: form.vinculado_extensao === "sim",
            curricularizado: form.curricular === "sim",
            natureza: form.natureza || null,
            abrangencia: form.abrangencia,
            publico_alvo: form.publico_alvo,
            grande_area_cnpq: form.area_conhecimento_cnpq || null,
            area_tematica_principal: form.area_tematica_principal || null,
            area_tematica_secundaria: form.area_tematica_secundaria || null,
            linha_extensao: form.linha_extensao || null,
        };
        const descricaoDados = {
            resumo: form.resumo || null,
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
        const payload = {
            //ABA IDENTIFICAÇÃO
            ano: new Date().getFullYear(),
            titulo: form.titulo,
            coordenador: form.coordenador_vinculo,
            unidade_proponente: form.unidade ? Number(form.unidade) : null,
            departamento_proponente: form.departamento ? Number(form.departamento) : null,
            endereco: enderecoDados,
            contatos: contatosDados,
            //ABA CARACTERIZAÇÃO
            caracterizacao : caracterizacaoDados,
            //ABA DESCRIÇÃO
            // O backend cria a Descrição junto com o projeto, mas o conteúdo
            // dela só entra por aqui.
            descricao: descricaoDados,
            //ABA PLANO DE TRABALHO
            planos_trabalho: [{
                ano: new Date().getFullYear(),
                resultados_esperados: form.resultados_esperados,
                cronograma_atividades: form.cronograma_atividades,
            }],
            //ABAS DE TABELA
            unidades_envolvidas: linhasDeUnidadesEnvolvidas(),
            parcerias_internas: linhasDeParceriasInternas(),
            parcerias_externas: linhasDeParceriasExternas(),
            demandas_bolsa: linhasDeDemandasBolsa(),
            locais_realizacao: linhasDeLocaisRealizacao(),
            membros_equipe: linhasDeMembrosEquipe(),
        };

        setEnviando(true);
        setErroEnvio(null);
        setConfirmando(false);
        try {
            // Modo edição: atualiza o projeto e as seções simples via PATCH.
            // As abas de tabela já salvam sozinhas (modo API), então não
            // entram aqui para não duplicar linhas.
            if (editando && idDaUrl) {
                await atualizarProjeto(idDaUrl, {
                    titulo: form.titulo,
                    coordenador: form.coordenador_vinculo,
                    unidade_proponente: form.unidade ? Number(form.unidade) : null,
                    departamento_proponente: form.departamento ? Number(form.departamento) : null,
                });
                await Promise.all([
                    atualizarEndereco(idDaUrl, enderecoDados),
                    atualizarCaracterizacao(idDaUrl, caracterizacaoDados),
                    atualizarDescricao(idDaUrl, descricaoDados),
                ]);

                const [palavrasResp, contatosResp, abasResp] = await Promise.all([
                    api.get(`/projetos/${idDaUrl}/palavras_chave/`),
                    api.get(`/projetos/${idDaUrl}/contatos/`),
                    api.get(`/projetos/${idDaUrl}/abas/`),
                ]);
                const palavrasGravadas = (
                    Array.isArray(palavrasResp.data) ? palavrasResp.data : palavrasResp.data.results ?? []
                );
                const palavrasForm = form.palavras_chave.map((p) => p.trim()).filter((p) => p);
                const contaPalavrasForm = {};
                for (const p of palavrasForm) {
                    const chave = p.toLowerCase();
                    contaPalavrasForm[chave] = (contaPalavrasForm[chave] ?? 0) + 1;
                }
                const contaPalavrasGravadas = {};
                for (const p of palavrasGravadas) {
                    const chave = p.palavra.trim().toLowerCase();
                    contaPalavrasGravadas[chave] = (contaPalavrasGravadas[chave] ?? 0) + 1;
                }
                for (const p of palavrasGravadas) {
                    const chave = p.palavra.trim().toLowerCase();
                    if ((contaPalavrasForm[chave] ?? 0) < contaPalavrasGravadas[chave]) {
                        contaPalavrasGravadas[chave] -= 1;
                        await excluirPalavraChave(idDaUrl, p.id);
                    }
                }
                for (const palavra of palavrasForm) {
                    const chave = palavra.toLowerCase();
                    if ((contaPalavrasGravadas[chave] ?? 0) > 0) {
                        contaPalavrasGravadas[chave] -= 1;
                    } else {
                        await criarPalavraChave(idDaUrl, { palavra });
                    }
                }
                const contatosLista = (
                    Array.isArray(contatosResp.data) ? contatosResp.data : contatosResp.data.results ?? []
                );
                const contaContatosForm = {};
                for (const c of contatosDados) {
                    const chave = `${c.tipo_contato}|${c.valor.trim().toLowerCase()}`;
                    contaContatosForm[chave] = (contaContatosForm[chave] ?? 0) + 1;
                }
                const contaContatosGravados = {};
                for (const c of contatosLista) {
                    const chave = `${c.tipo_contato}|${c.valor.trim().toLowerCase()}`;
                    contaContatosGravados[chave] = (contaContatosGravados[chave] ?? 0) + 1;
                }
                for (const c of contatosLista) {
                    const chave = `${c.tipo_contato}|${c.valor.trim().toLowerCase()}`;
                    if ((contaContatosForm[chave] ?? 0) < contaContatosGravados[chave]) {
                        contaContatosGravados[chave] -= 1;
                        await excluirContato(idDaUrl, c.id);
                    }
                }
                for (const contato of contatosDados) {
                    const chave = `${contato.tipo_contato}|${contato.valor.trim().toLowerCase()}`;
                    if ((contaContatosGravados[chave] ?? 0) > 0) {
                        contaContatosGravados[chave] -= 1;
                    } else {
                        await criarContato(idDaUrl, contato);
                    }
                }

                // Plano de trabalho atualiza o primeiro ou cria se não houver,
                // preservando o ano do plano existente.
                const planos = abasResp.data?.planos_trabalho ?? [];
                const planoDados = {
                    ano: planos.length > 0 ? planos[0].ano : new Date().getFullYear(),
                    resultados_esperados: form.resultados_esperados,
                    cronograma_atividades: form.cronograma_atividades,
                };
                if (planos.length > 0) {
                    await atualizarPlanoDeTrabalho(idDaUrl, planos[0].id, planoDados);
                } else {
                    await criarPlanoDeTrabalho(idDaUrl, planoDados);
                }

                navigate("/Projetos/SeusProjetos");
                return;
            }

            let projeto_id = projetoId;
            if (!projeto_id) {
                projeto_id = await criarProjeto(payload);
                setProjetoId(projeto_id);
            }

            // Todas as abas já foram no payload do POST; só as palavras-chave
            // continuam tendo endpoint próprio.
            const palavras = form.palavras_chave.map((p) => p.trim()).filter((p) => p);
            for (const palavra of palavras) {
                await criarPalavraChave(projeto_id, { palavra });
            }

            navigate("/Projetos/SeusProjetos");
        } catch (erro) {
            // O corpo do erro do DRF diz o campo e o motivo do erro (futuramente fica mais elegante exibir o erro usando o padrão de outros erros)
            const detalhe = erro.response?.data;
            window.alert(detalhe
                ? JSON.stringify(detalhe)
                : 'Não foi possível salvar o projeto. Verifique a conexão e tente de novo.');
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

    // No modo edição, completa nome/matrícula do coordenador quando os vínculos carregam, a partir do vínculo já gravado no projeto.
    useEffect(() => {
        if (!editando || !form.coordenador_vinculo || form.matricula_coordenador) return;
        const vinculo = vinculosCoordenador.find(
            (v) => String(v.id) === String(form.coordenador_vinculo));
        if (vinculo) {
            atualizarCampo('matricula_coordenador', vinculo.matricula ?? '');
            atualizarCampo('coordenador', vinculo.nome_completo ?? '');
        }
    }, [editando, vinculosCoordenador, form.coordenador_vinculo]);

    return (
        <div className="container mt-4">
            {/* Mesma ideia da lista: o titulo fica so para leitor de tela,
                porque os botoes de etapa dizem onde a pessoa esta. */}
            <h1 className="visually-hidden">{editando ? "Edição de projeto" : "Cadastro de projeto"}</h1>

            {editando && carregandoEdicao && (
                <div className="d-flex align-items-center gap-3 mt-4" role="status" aria-live="polite">
                    <div className="spinner-border" aria-hidden="true"></div>
                    <p className="mb-0 fw-semibold">Carregando dados...</p>
                </div>
            )}

            {erroCarregamento && (
                <div className="alert alert-danger mt-3">{erroCarregamento}</div>
            )}

            {!(editando && carregandoEdicao) && (
            <>
            {/* Resumo das pendências: fica acima das abas e do formulário para
                ser visto sem rolar até o fim. O envio rola até aqui.
                Mostra só a contagem por aba; o detalhe está nos campos. */}
            {tentouEnviar && totalPendencias > 0 && (
                <div
                    ref={resumoRef}
                    tabIndex={-1}
                    role="alert"
                    aria-live="assertive"
                    className="alert alert-danger"
                >
                    <p className="mb-1 fw-semibold">
                        Faltam {totalPendencias} {totalPendencias === 1 ? 'item' : 'itens'} para enviar o projeto:
                    </p>
                    <ul className="mb-0">
                        {errosPorAba.map((erros, indice) => {
                            const qtd = Object.keys(erros).length;
                            if (qtd === 0) return null;
                            return (
                                <li key={ABAS[indice].id}>
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 align-baseline"
                                        onClick={() => irParaAbaComPendencia(indice)}
                                    >
                                        {ABAS[indice].label} ({qtd} {qtd === 1 ? 'item' : 'itens'})
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* A tira de abas: mostra todas as partes do formulario e deixa ir
                direto para uma delas, em vez de so avancar de uma em uma.
                Abas com pendência ficam vermelhas com a contagem. */}
            <ul className="nav nav-tabs" role="tablist">
                {ABAS.map((aba, indice) => {
                    const qtd = (errosPorAba[indice] && Object.keys(errosPorAba[indice]).length) || 0;
                    const comPendencia = qtd > 0;
                    return (
                        <li className="nav-item" key={aba.id} role="presentation">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={indice === etapaAtual}
                                aria-label={comPendencia ? `${aba.label} (${qtd} ${qtd === 1 ? 'item pendente' : 'itens pendentes'})` : aba.label}
                                title={comPendencia ? `${qtd} ${qtd === 1 ? 'item pendente' : 'itens pendentes'}` : undefined}
                                className={`nav-link ${indice === etapaAtual ? 'active' : ''} ${comPendencia ? 'text-danger fw-semibold' : ''}`}
                                onClick={() => irParaEtapa(indice)}
                            >
                                {aba.label}
                                {comPendencia && (
                                    <span className="badge text-bg-danger ms-1" aria-hidden="true">
                                        {qtd}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div ref={conteudoRef} className="p-3 border border-top-0 rounded-bottom bg-body-tertiary">

                {etapaAtual === 0 && (
                    <Identificacao
                        form={form}
                        atualizarCampo={atualizarCampo}
                        vinculosCoordenador={vinculosCoordenador}
                        carregandoVinculos={carregandoVinculos}
                        erroVinculos={erroVinculos}
                        recarregarVinculos={recarregarVinculos}
                        unidades={unidades}
                        departamentos={departamentos}
                        buscarCep={buscarCep}
                        buscandoCep={buscandoCep}
                        avisoCep={avisoCep}
                        errosValidacao={errosValidacao}
                    />
                )}

                {etapaAtual === 1 && (
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
                        errosValidacao={errosValidacao}
                    />
                )}


                {etapaAtual === 2 && (
                    <Descricao
                        form={form}
                        atualizarCampo={atualizarCampo}
                        errosValidacao={errosValidacao}
                    />
                )}

                {etapaAtual === 3 && (
                    <PlanoTrabalho
                        form={form}
                        atualizarCampo={atualizarCampo}
                    />
                )}

                {etapaAtual === 4 && (
                    <UnidadesEnvolvidas
                        projetoId={idDaUrl ?? projetoId}
                        unidades={unidades}
                        departamentos={departamentos}
                        valor={form.unidadesEnvolvidas}
                        onChange={(linhas) => atualizarCampo("unidadesEnvolvidas", linhas)}
                    />
                )}

                {etapaAtual === 5 && (
                    <Parcerias
                        projetoId={idDaUrl ?? projetoId}
                        unidades={unidades}
                        departamentos={departamentos}
                        form={form}
                        atualizarCampo={atualizarCampo}
                    />
                )}

                {etapaAtual === 6 && (
                    <DemandasBolsa
                        projetoId={idDaUrl ?? projetoId}
                        valor={form.demandasBolsa}
                        onChange={(linhas) => atualizarCampo("demandasBolsa", linhas)}
                    />
                )}

                {/* As abas ficam escondidas, não desmontadas, pra não perder as
                    linhas nem recarregar o dropdown ao trocar de aba. */}
                <div hidden={etapaAtual !== 7}>
                    <LocaisRealizacao
                        projetoId={idDaUrl ?? projetoId}
                        valor={form.locaisRealizacao}
                        onChange={(linhas) => atualizarCampo("locaisRealizacao", linhas)}
                    />
                </div>

                <div hidden={etapaAtual !== 8}>
                    <MembrosEquipe
                        projetoId={idDaUrl ?? projetoId}
                        coordenador={form.coordenador}
                        valor={form.membrosEquipe}
                        onChange={(linhas) => atualizarCampo("membrosEquipe", linhas)}
                    />
                </div>

                <div className="d-flex justify-content-end gap-2">
                    {etapaAtual > 0 && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={etapaAnterior}
                        >
                            Voltar
                        </button>
                    )}

                    {etapaAtual < ABAS.length - 1 && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={proximaEtapa}
                        >
                            Avançar
                        </button>
                    )}

                    {/* O envio e um so, e aparece em qualquer aba: quem terminou
                        de preencher nao precisa andar ate a ultima para enviar. */}
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={abrirConfirmacao}
                        disabled={enviando || carregandoEdicao}
                    >
                        {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Enviar projeto'}
                    </button>
                </div>
            </div>
            </>
            )}

            {confirmando && (
                <div
                    className="modal d-block"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="titulo-confirmar-envio"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setConfirmando(false)}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 className="modal-title h5" id="titulo-confirmar-envio">{editando ? 'Salvar alterações?' : 'Enviar o projeto?'}</h2>
                                <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setConfirmando(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    O projeto <strong>{form.titulo}</strong> será {editando ? 'atualizado.' : 'enviado para a Pró-Reitoria de Extensão e ficará como proposta aguardando documentação.'}
                                </p>
                                <p className="mb-0">
                                    Confira se está tudo preenchido antes de enviar. Depois do envio,
                                    as mudanças passam pela lista de projetos.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setConfirmando(false)}>
                                    Revisar antes
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={salvarDadosIdentificacao}
                                    disabled={enviando || carregandoEdicao}
                                >
                                    {enviando ? 'Salvando...' : editando ? 'Confirmar alterações' : 'Confirmar envio'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default CadastrarProjeto;
