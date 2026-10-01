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
import Parcerias from './abas/Parcerias';

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
    criarPalavraChave
} from '../../../services/projetoService';

const ABAS = [
    { id: "identificacao", label: "Identificação" },
    { id: "caracterizacao", label: "Caracterização" },
    { id: "descricao", label: "Descrição" },
    { id: "plano-de-trabalho", label: "Plano de Trabalho" },
    { id: "unidades-envolvidas", label: "Unidades Envolvidas" },
    { id: "parcerias", label: "Parcerias" },
    { id: "locais-realizacao", label: "Locais de Realização" },
    { id: "membros-equipe", label: "Membros da Equipe" },
];


function CadastrarProjeto() {
    const navigate = useNavigate();

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

    function obterErrosEtapa(f = form) {
           if (etapaAtual === 0) return validarEtapa0(f);
           if (etapaAtual === 1) return validarEtapa1(f);
           if (etapaAtual === 2) return validarEtapa2(f);
           return {};
    }

    function proximaEtapa() {
           const erros = obterErrosEtapa();
           setErrosValidacao(erros);
           if (Object.keys(erros).length === 0) {
               setEtapaAtual((prev) => Math.min(prev + 1, ABAS.length - 1));
           }
    }

    function etapaAnterior() {
        setEtapaAtual((prev) => Math.max(prev - 1, 0));
    }

    // Clicar numa aba leva direto para ela. Voltar para uma aba anterior nao
    // cobra nada, so avancar e que cobra o que falta na aba atual, igual ao
    // botao Avancar.
    function irParaEtapa(indice) {
        if (indice === etapaAtual) return;
        if (indice < etapaAtual) {
            setErrosValidacao({});
            setEtapaAtual(indice);
            return;
        }
        const erros = obterErrosEtapa();
        setErrosValidacao(erros);
        if (Object.keys(erros).length === 0) {
            setEtapaAtual(indice);
        }
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
        setForm((prev) => {
            const atualizado = { ...prev, [campo]: valor };
            // A caixa vermelha some assim que o campo deixa de estar errado,
            // em vez de so sumir no proximo clique em Avancar.
            setErrosValidacao((errosAtuais) => {
                if (!errosAtuais[campo]) return errosAtuais;
                if (obterErrosEtapa(atualizado)[campo]) return errosAtuais;
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
    async function salvarDadosIdentificacao() {
        const payload = {
            //ABA IDENTIFICAÇÃO
            ano: new Date().getFullYear(),
            titulo: form.titulo,
            coordenador: form.coordenador_vinculo,
            unidade_proponente: form.unidade ? Number(form.unidade) : null,
            departamento_proponente: form.departamento ? Number(form.departamento) : null,
            endereco: {
                cep: form.cep,
                logradouro: form.logradouro,
                numero: form.numero,
                complemento: form.complemento,
                bairro: form.bairro,
                municipio: form.municipio ? Number(form.municipio) : null,
            },
            contatos: [
                ...form.telefones.map((valor) => ({ tipo_contato: 'TELEFONE', valor: valor.trim() })),
                ...form.emails.map((valor) => ({ tipo_contato: 'EMAIL', valor: valor.trim() })),
            ].filter((c) => c.valor),
            //ABA CARACTERIZAÇÃO
            caracterizacao : {
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
            },
            //ABA DESCRIÇÃO
            // O backend cria a Descrição junto com o projeto, mas o conteúdo
            // dela só entra por aqui.
            descricao: {
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
            },
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
            locais_realizacao: linhasDeLocaisRealizacao(),
            membros_equipe: linhasDeMembrosEquipe(),
        };

        setEnviando(true);
        setErroEnvio(null);
        try {
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

    return (
        <div className="container mt-4">
            {/* Mesma ideia da lista: o titulo fica so para leitor de tela,
                porque os botoes de etapa dizem onde a pessoa esta. */}
            <h1 className="visually-hidden">Cadastro de projeto</h1>

            {/* A tira de abas: mostra todas as partes do formulario e deixa ir
                direto para uma delas, em vez de so avancar de uma em uma. */}
            <ul className="nav nav-tabs" role="tablist">
                {ABAS.map((aba, indice) => (
                    <li className="nav-item" key={aba.id} role="presentation">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={indice === etapaAtual}
                            className={`nav-link ${indice === etapaAtual ? 'active' : ''}`}
                            onClick={() => irParaEtapa(indice)}
                        >
                            {aba.label}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="p-3 border border-top-0 rounded-bottom bg-body-tertiary">

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
                        unidades={unidades}
                        departamentos={departamentos}
                        valor={form.unidadesEnvolvidas}
                        onChange={(linhas) => atualizarCampo("unidadesEnvolvidas", linhas)}
                    />
                )}

                {etapaAtual === 5 && (
                    <Parcerias
                        unidades={unidades}
                        departamentos={departamentos}
                        form={form}
                        atualizarCampo={atualizarCampo}
                    />
                )}

                {/* As abas ficam escondidas, não desmontadas, pra não perder as
                    linhas nem recarregar o dropdown ao trocar de aba. */}
                <div hidden={etapaAtual !== 6}>
                    <LocaisRealizacao
                        valor={form.locaisRealizacao}
                        onChange={(linhas) => atualizarCampo("locaisRealizacao", linhas)}
                    />
                </div>

                <div hidden={etapaAtual !== 7}>
                    <MembrosEquipe
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

                    {etapaAtual < ABAS.length - 1 ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={proximaEtapa}
                        >
                            Avançar
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={salvarDadosIdentificacao}
                            disabled={enviando}
                        >
                            Enviar Formulário
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}

export default CadastrarProjeto;
