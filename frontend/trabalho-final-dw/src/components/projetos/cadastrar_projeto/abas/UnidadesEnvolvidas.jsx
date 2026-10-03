import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';

function UnidadesEnvolvidas({ projetoId, unidades, departamentos, valor = [], onChange, errosValidacao }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);

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

            <div className="table-responsive">
                <table className="table table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th scope="col" style={{ width: '4rem' }}>Nº</th>
                            <th scope="col" style={{ width: '4rem' }}>
                                <i className="bi bi-trash" aria-hidden="true"></i>
                                <span className="visually-hidden">Excluir</span>
                            </th>
                            <th scope="col">* Unidade</th>
                            <th scope="col">* Departamento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-muted text-center">
                                    Nenhuma unidade cadastrada.
                                </td>
                            </tr>
                        )}
                        {linhas.map((linha, i) => (
                            <tr key={linha.id ?? `nova-${i}`}>
                                <td>{i + 1}.</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => excluir(i)}
                                        aria-label={`Excluir unidade ${i + 1}`}
                                    >
                                        <i className="bi bi-trash" aria-hidden="true"></i>
                                    </button>
                                </td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={linha.unidade}
                                        required
                                        aria-label={`Unidade envolvida ${i + 1}`}
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
                                </td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={linha.departamento}
                                        disabled={!linha.unidade}
                                        required
                                        aria-label={`Departamento da unidade ${i + 1}`}
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </fieldset>
    );
}

export default UnidadesEnvolvidas;