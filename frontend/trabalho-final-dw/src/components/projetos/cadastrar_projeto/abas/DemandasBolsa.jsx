import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import CampoTextoLongo from '../CampoTextoLongo';
import DialogoFormulario from '../DialogoFormulario';
import CartaoItem, { DetalheItem } from '../CartaoItem';
import ModalAlerta from '../../../comum/ModalAlerta';

const TIPOS_BOLSA = [
    { valor: 'IC', rotulo: 'Iniciação Científica' },
    { valor: 'EXTENSAO', rotulo: 'Extensão' },
    { valor: 'MONITORIA', rotulo: 'Monitoria' },
    { valor: 'PIBID', rotulo: 'PIBID' },
    { valor: 'RESIDENCIA', rotulo: 'Residência' },
    { valor: 'OUTRO', rotulo: 'Outro' },
];

const LINHA_VAZIA = { id: null, tipo_bolsa: '', quantidade: 1, justificativa: '' };

function DemandasBolsa({ projetoId, valor = [], onChange, errosValidacao }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const [edicao, setEdicao] = useState(null);
    const [exclusaoPendente, setExclusaoPendente] = useState(null);

    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/demandas-bolsa/`)
            .then((r) => setLinhas((atuais) => [
                ...r.data,
                ...atuais.filter((l) => !l.id),
            ]))
            .catch(() => setErro('Não foi possível carregar as demandas já cadastradas.'));
    }, [projetoId]);

    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function completa(linha) {
        return Boolean(linha.tipo_bolsa) && Number(linha.quantidade) >= 1;
    }

    function tipoRepetido(linha, indice) {
        return linhas.some((l, i) => i !== indice && l.tipo_bolsa === linha.tipo_bolsa);
    }

    function abrirNova() {
        setEdicao({ indice: null, dados: { ...LINHA_VAZIA } });
    }

    function abrirEdicao(indice) {
        setEdicao({ indice, dados: { ...linhas[indice] } });
    }

    function mudarCampo(mudancas) {
        setEdicao((atual) => ({ ...atual, dados: { ...atual.dados, ...mudancas } }));
    }

    async function salvar() {
        const { indice, dados } = edicao;
        if (!completa(dados)) return;
        if (tipoRepetido(dados, indice)) {
            setErro('Este tipo de bolsa já foi pedido. Altere a quantidade da linha existente.');
            setEdicao(null);
            return;
        }

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
                tipo_bolsa: dados.tipo_bolsa,
                quantidade: Number(dados.quantidade),
                justificativa: dados.justificativa,
            };
            const resposta = dados.id
                ? await api.patch(`/projetos/${projetoId}/demandas-bolsa/${dados.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/demandas-bolsa/`, corpo);
            const gravada = { ...dados, id: resposta.data.id };
            setLinhas((atuais) => (indice === null
                ? [...atuais, gravada]
                : atuais.map((l, i) => (i === indice ? gravada : l))));
            setEdicao(null);
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar a demanda de bolsa.');
        }
    }

    async function excluir(indice) {
        const linha = linhas[indice];
        if (projetoId && linha.id) {
            try {
                await api.delete(`/projetos/${projetoId}/demandas-bolsa/${linha.id}/`);
            } catch {
                setErro('Erro ao excluir a demanda de bolsa.');
                return;
            }
        }
        setLinhas((atuais) => atuais.filter((_, i) => i !== indice));
    }

    async function confirmarExclusao() {
        const indice = exclusaoPendente;
        setExclusaoPendente(null);
        if (indice !== null) await excluir(indice);
    }

    function nomeTipo(linha) {
        if (linha.tipo_bolsa_display) return linha.tipo_bolsa_display;
        const t = TIPOS_BOLSA.find((x) => x.valor === linha.tipo_bolsa);
        return t ? t.rotulo : '—';
    }

    const total = linhas.reduce((soma, l) => soma + Number(l.quantidade || 0), 0);
    const dados = edicao?.dados;

    return (
        <fieldset>
            <legend>Demanda de Bolsa de Extensão</legend>

            <p className="small text-body-secondary">
                Quantas bolsas o projeto pede, por tipo. Cada tipo entra uma vez só;
                para pedir mais de um, aumente a quantidade.
            </p>

            {errosValidacao.demandasBolsa && <div className="alert alert-danger py-2">{errosValidacao.demandasBolsa}</div>}
            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={abrirNova}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Nova demanda
            </button>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {linhas.length === 0 ? (
                <p className="text-muted">Nenhuma bolsa pedida.</p>
            ) : (
                <>
                    <div className="row g-3">
                        {linhas.map((linha, i) => (
                            <CartaoItem
                                key={linha.id ?? `nova-${i}`}
                                titulo={nomeTipo(linha)}
                                acoes={
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary flex-grow-1"
                                            onClick={() => abrirEdicao(i)}
                                            aria-label={`Editar a demanda ${i + 1}`}
                                            title="Editar"
                                        >
                                            <i className="bi bi-pencil d-block mb-1" aria-hidden="true"></i>Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger flex-grow-1"
                                            onClick={() => setExclusaoPendente(i)}
                                            aria-label={`Excluir a demanda ${i + 1}`}
                                            title="Excluir"
                                        >
                                            <i className="bi bi-trash d-block mb-1" aria-hidden="true"></i>Excluir
                                        </button>
                                    </>
                                }
                            >
                                <DetalheItem icone="bi-123" rotulo="Quantidade" valor={linha.quantidade} />
                                <DetalheItem icone="bi-card-text" rotulo="Justificativa" valor={linha.justificativa} />
                            </CartaoItem>
                        ))}
                    </div>
                    <p className="fw-semibold mt-3 mb-0">Total de bolsas: {total}</p>
                </>
            )}

            {edicao && (
                <DialogoFormulario
                    titulo={edicao.indice === null ? 'Nova demanda de bolsa' : 'Editar demanda de bolsa'}
                    aoSalvar={salvar}
                    aoFechar={() => setEdicao(null)}
                    salvarDesabilitado={!completa(dados)}
                >
                    <div className="mb-3">
                        <label className="form-label" htmlFor="db-tipo">Tipo de bolsa *</label>
                        <select
                            id="db-tipo"
                            className="form-select"
                            value={dados.tipo_bolsa}
                            required
                            onChange={(e) => mudarCampo({ tipo_bolsa: e.target.value })}
                        >
                            <option value="">[Selecione]</option>
                            {TIPOS_BOLSA.map((t) => (
                                <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="db-quantidade">Quantidade *</label>
                        <input
                            id="db-quantidade"
                            type="number"
                            className="form-control"
                            min={1}
                            max={99}
                            value={dados.quantidade}
                            required
                            onChange={(e) => mudarCampo({ quantidade: e.target.value })}
                        />
                    </div>

                    <CampoTextoLongo
                        rotulo="Justificativa"
                        ajuda="Explique por que o projeto precisa dessas bolsas e o que os bolsistas vão fazer."
                        campo="justificativa"
                        limite={1000}
                        linhas={4}
                        valor={dados.justificativa ?? ''}
                        aoMudar={(campo, texto) => mudarCampo({ [campo]: texto })}
                    />
                </DialogoFormulario>
            )}

            {exclusaoPendente !== null && linhas[exclusaoPendente] && (
                <ModalAlerta
                    variante="aviso"
                    titulo="Excluir demanda?"
                    mensagem={`Excluir a demanda "${nomeTipo(linhas[exclusaoPendente])}"? Esta ação não pode ser desfeita.`}
                    textoConfirmar="Excluir"
                    aoConfirmar={confirmarExclusao}
                    aoFechar={() => setExclusaoPendente(null)}
                />
            )}
        </fieldset>
    );
}

export default DemandasBolsa;
