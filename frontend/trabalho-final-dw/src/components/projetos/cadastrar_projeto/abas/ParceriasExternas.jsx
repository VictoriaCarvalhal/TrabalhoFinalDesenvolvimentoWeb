import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import CampoTextoLongo from '../CampoTextoLongo';
import DialogoFormulario from '../DialogoFormulario';
import DialogoVisualizacao from '../DialogoVisualizacao';
import CampoSomenteLeitura from '../CampoSomenteLeitura';
import CartaoItem, { DetalheItem } from '../CartaoItem';

// Lista copiada do backend (projetos.TipoInstituicaoExterna).
const TIPOS_INSTITUICAO = [
    { valor: 'GOV_FEDERAL', rotulo: 'Instituição Governamental Federal' },
    { valor: 'GOV_ESTADUAL', rotulo: 'Instituição Governamental Estadual' },
    { valor: 'GOV_MUNICIPAL', rotulo: 'Instituição Governamental Municipal' },
    { valor: 'INICIATIVA_PRIVADA', rotulo: 'Organização da Iniciativa Privada' },
    { valor: 'MOVIMENTO_SOCIAL', rotulo: 'Movimento Social' },
    { valor: 'ONG', rotulo: 'Organização Não Governamental' },
    { valor: 'OUTRO', rotulo: 'Outros' },
];

const LINHA_VAZIA = {
    id: null, nome_instituicao: '', sigla_instituicao: '', tipo_instituicao: '', participacao: '',
};

// Mesma forma das parcerias internas: a aba lista o que já existe e o
// preenchimento acontece num diálogo.
function ParceriasExternas({ projetoId, valor = [], onChange, tituloOculto = false, errosValidacao }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const [edicao, setEdicao] = useState(null);

    // Linha aberta no modal de visualização (só leitura). null = fechado.
    const [visualizacao, setVisualizacao] = useState(null);

    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/parcerias-externas/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar as parcerias já cadastradas.'));
    }, [projetoId]);

    // Toda mudança nas linhas sobe pra página que hospeda a aba.
    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    // A instituição e o tipo são obrigatórios no modelo.
    function completa(linha) {
        return Boolean(linha.nome_instituicao && linha.tipo_instituicao);
    }

    function abrirNova() {
        setEdicao({ indice: null, dados: { ...LINHA_VAZIA } });
    }

    function abrirEdicao(indice) {
        setEdicao({ indice, dados: { ...linhas[indice] } });
    }

    function abrirVisualizacao(indice) {
        setVisualizacao(linhas[indice]);
    }

    function mudarCampo(mudancas) {
        setEdicao((atual) => ({ ...atual, dados: { ...atual.dados, ...mudancas } }));
    }

    async function salvar() {
        const { indice, dados } = edicao;
        if (!completa(dados)) return;

        // Sem projeto gravado ainda, a parceria fica na lista e sobe junto no envio.
        if (!projetoId) {
            setLinhas((atuais) => (indice === null
                ? [...atuais, dados]
                : atuais.map((l, i) => (i === indice ? dados : l))));
            setEdicao(null);
            return;
        }

        try {
            setErro(null);
            const corpo = {
                nome_instituicao: dados.nome_instituicao,
                sigla_instituicao: dados.sigla_instituicao,
                tipo_instituicao: dados.tipo_instituicao,
                participacao: dados.participacao,
            };
            const resposta = dados.id
                ? await api.patch(`/projetos/${projetoId}/parcerias-externas/${dados.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/parcerias-externas/`, corpo);
            const gravada = { ...dados, id: resposta.data.id };
            setLinhas((atuais) => (indice === null
                ? [...atuais, gravada]
                : atuais.map((l, i) => (i === indice ? gravada : l))));
            setEdicao(null);
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar a parceria externa.');
        }
    }

    async function excluir(indice) {
        const linha = linhas[indice];
        if (projetoId && linha.id) {
            try {
                await api.delete(`/projetos/${projetoId}/parcerias-externas/${linha.id}/`);
            } catch {
                setErro('Erro ao excluir a parceria externa.');
                return;
            }
        }
        setLinhas((atuais) => atuais.filter((_, i) => i !== indice));
    }

    // A API devolve o tipo por extenso no GET; uma parceria recém-digitada
    // só tem o código, então o nome sai da lista local.
    function nomeTipo(linha) {
        if (linha.tipo_instituicao_display) return linha.tipo_instituicao_display;
        const t = TIPOS_INSTITUICAO.find((x) => x.valor === linha.tipo_instituicao);
        return t ? t.rotulo : '—';
    }

    const dados = edicao?.dados;

    return (
        <fieldset>
            <legend className={tituloOculto ? 'visually-hidden' : ''}>Parcerias Externas</legend>

            <p className="small text-body-secondary">
                Instituições de fora da universidade que colaboram com o projeto.
                Use o botão abaixo para acrescentar uma.
            </p>

            {errosValidacao && <div className="alert alert-danger py-2">{errosValidacao}</div>}
            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={abrirNova}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Nova parceria externa
            </button>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {linhas.length === 0 ? (
                <p className="text-muted">Nenhuma parceria externa cadastrada.</p>
            ) : (
                <div className="row g-3">
                    {linhas.map((linha, i) => (
                        <CartaoItem
                            key={linha.id ?? `nova-${i}`}
                            titulo={`${linha.nome_instituicao}${linha.sigla_instituicao ? ` (${linha.sigla_instituicao})` : ''}`}
                            acoes={
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                                        onClick={() => abrirVisualizacao(i)}
                                        aria-label={`Visualizar a parceria externa ${i + 1}`}
                                        title="Visualizar"
                                    >
                                        <i className="bi bi-eye d-block mb-1" aria-hidden="true"></i>Ver
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                                        onClick={() => abrirEdicao(i)}
                                        aria-label={`Editar a parceria externa ${i + 1}`}
                                        title="Editar"
                                    >
                                        <i className="bi bi-pencil d-block mb-1" aria-hidden="true"></i>Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger flex-grow-1"
                                        onClick={() => excluir(i)}
                                        aria-label={`Excluir a parceria externa ${i + 1}`}
                                        title="Excluir"
                                    >
                                        <i className="bi bi-trash d-block mb-1" aria-hidden="true"></i>Excluir
                                    </button>
                                </>
                            }
                        >
                            <DetalheItem icone="bi-tag" rotulo="Tipo" valor={nomeTipo(linha)} />
                            <DetalheItem icone="bi-chat-left-text" rotulo="Participação" valor={linha.participacao} />
                        </CartaoItem>
                    ))}
                </div>
            )}

            {edicao && (
                <DialogoFormulario
                    titulo={edicao.indice === null ? 'Nova parceria externa' : 'Editar parceria externa'}
                    aoSalvar={salvar}
                    aoFechar={() => setEdicao(null)}
                    salvarDesabilitado={!completa(dados)}
                >
                    <div className="mb-3">
                        <label className="form-label" htmlFor="pe-nome">Nome da instituição *</label>
                        <input
                            id="pe-nome"
                            type="text"
                            className="form-control"
                            value={dados.nome_instituicao}
                            maxLength={255}
                            required
                            onChange={(e) => mudarCampo({ nome_instituicao: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="pe-sigla">Sigla da instituição</label>
                        <input
                            id="pe-sigla"
                            type="text"
                            className="form-control"
                            value={dados.sigla_instituicao}
                            maxLength={50}
                            onChange={(e) => mudarCampo({ sigla_instituicao: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="pe-tipo">Tipo de instituição *</label>
                        <select
                            id="pe-tipo"
                            className="form-select"
                            value={dados.tipo_instituicao}
                            required
                            onChange={(e) => mudarCampo({ tipo_instituicao: e.target.value })}
                        >
                            <option value="">[Selecione]</option>
                            {TIPOS_INSTITUICAO.map((tipo) => (
                                <option key={tipo.valor} value={tipo.valor}>{tipo.rotulo}</option>
                            ))}
                        </select>
                    </div>

                    <CampoTextoLongo
                        rotulo="Participação da instituição no projeto"
                        ajuda="Descreva de que forma essa instituição colabora: o que ela oferece ao projeto (pessoas, espaço, equipamento, recursos) e em quais atividades participa."
                        campo="participacao"
                        limite={500}
                        linhas={4}
                        valor={dados.participacao ?? ''}
                        aoMudar={(campo, texto) => mudarCampo({ [campo]: texto })}
                    />
                </DialogoFormulario>
            )}

            {visualizacao && (
                <DialogoVisualizacao
                    titulo="Detalhes da parceria externa"
                    aoFechar={() => setVisualizacao(null)}
                >
                    <CampoSomenteLeitura
                        rotulo="Instituição"
                        valor={`${visualizacao.nome_instituicao}${visualizacao.sigla_instituicao ? ` (${visualizacao.sigla_instituicao})` : ''}`}
                    />
                    <CampoSomenteLeitura rotulo="Tipo de instituição" valor={nomeTipo(visualizacao)} />
                    <CampoSomenteLeitura rotulo="Participação da instituição no projeto" valor={visualizacao.participacao} />
                </DialogoVisualizacao>
            )}
        </fieldset>
    );
}

export default ParceriasExternas;