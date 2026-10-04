import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import CartaoItem from '../CartaoItem';
import ModalAlerta from '../../../comum/ModalAlerta';

function UnidadesEnvolvidas({ projetoId, unidades, departamentos, valor = [], onChange, errosValidacao }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const [exclusaoPendente, setExclusaoPendente] = useState(null);

    // Com projeto, as linhas gravadas vêm da API.
    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/unidades-envolvidas/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar as unidades já cadastradas.'));
    }, [projetoId]);

    // Toda mudança nas linhas sobe pra página que hospeda a aba.
    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function novaLinha() {
        setLinhas((atuais) => [...atuais, { id: null, unidade: '', departamento: '' }]);
    }

    function editar(indice, campo, valorCampo) {
        setLinhas((atuais) => atuais.map((l, i) => (i === indice ? { ...l, [campo]: valorCampo } : l)));
    }

    async function gravar(indice) {
        // Só grava quando os dois campos obrigatórios estão preenchidos.
        const linha = linhas[indice];
        if (!projetoId || !linha.unidade || !linha.departamento) return;
        try {
            setErro(null);
            const corpo = { unidade: linha.unidade, departamento: linha.departamento };
            const resposta = linha.id
                ? await api.patch(`/projetos/${projetoId}/unidades-envolvidas/${linha.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/unidades-envolvidas/`, corpo);
            editar(indice, 'id', resposta.data.id);
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar a unidade.');
        }
    }

    async function excluir(indice) {
        const linha = linhas[indice];
        if (projetoId && linha.id) {
            try {
                await api.delete(`/projetos/${projetoId}/unidades-envolvidas/${linha.id}/`);
            } catch {
                setErro('Erro ao excluir a unidade.');
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

    return (
        <fieldset>
            <legend>Unidades Envolvidas</legend>

            <p className="small text-body-secondary mb-1">Os campos com * são obrigatórios.</p>
            <p className="small text-body-secondary">Use o botão abaixo para acrescentar uma unidade.</p>

            {errosValidacao.unidadesEnvolvidas && <div className="alert alert-danger py-2">{errosValidacao.unidadesEnvolvidas}</div>}
            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={novaLinha}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo
            </button>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {linhas.length === 0 ? (
                <p className="text-muted">Nenhuma unidade cadastrada.</p>
            ) : (
                <div className="row g-3">
                    {linhas.map((linha, i) => (
                        <CartaoItem
                            key={linha.id ?? `nova-${i}`}
                            titulo={`Unidade ${i + 1}`}
                            acoes={
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => setExclusaoPendente(i)}
                                    aria-label={`Excluir unidade ${i + 1}`}
                                    title="Excluir"
                                >
                                    <i className="bi bi-trash me-1" aria-hidden="true"></i>Excluir
                                </button>
                            }
                        >
                            <div className="mb-2">
                                <label className="form-label" htmlFor={`ue-unidade-${i}`}>Unidade *</label>
                                <select
                                    id={`ue-unidade-${i}`}
                                    className="form-select"
                                    value={linha.unidade}
                                    required
                                    onChange={(e) => {
                                        const novaUnidade = e.target.value;
                                        setLinhas((atuais) =>
                                            atuais.map((l, idx) => (idx === i ? { ...l, unidade: novaUnidade, departamento: '' } : l))
                                        );
                                    }}
                                    onBlur={() => gravar(i)}
                                >
                                    <option value="">[Selecione]</option>
                                    {unidades.map((unidade) => (
                                        <option key={unidade.id} value={unidade.id}>
                                            {unidade.sigla} — {unidade.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label" htmlFor={`ue-departamento-${i}`}>Departamento *</label>
                                <select
                                    id={`ue-departamento-${i}`}
                                    className="form-select"
                                    value={linha.departamento}
                                    disabled={!linha.unidade}
                                    required
                                    onChange={(e) => editar(i, 'departamento', e.target.value)}
                                    onBlur={() => gravar(i)}
                                >
                                    <option value="">
                                        {linha.unidade ? "[Selecione]" : "Escolha uma unidade primeiro"}
                                    </option>
                                    {departamentos
                                        .filter((d) => String(d.unidade) === String(linha.unidade))
                                        .map((departamento) => (
                                            <option key={departamento.id} value={departamento.id}>
                                                {departamento.nome}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </CartaoItem>
                    ))}
                </div>
            )}

            {exclusaoPendente !== null && linhas[exclusaoPendente] && (
                <ModalAlerta
                    variante="aviso"
                    titulo="Excluir unidade?"
                    mensagem={`Excluir a unidade ${exclusaoPendente + 1} desta lista? Esta ação não pode ser desfeita.`}
                    textoConfirmar="Excluir"
                    aoConfirmar={confirmarExclusao}
                    aoFechar={() => setExclusaoPendente(null)}
                />
            )}
        </fieldset>
    );
}

export default UnidadesEnvolvidas;