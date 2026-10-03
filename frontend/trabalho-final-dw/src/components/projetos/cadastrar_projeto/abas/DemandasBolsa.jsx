import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import CampoTextoLongo from '../CampoTextoLongo';
import DialogoFormulario from '../DialogoFormulario';

// Mesma lista do backend (projetos.TipoBolsa).
const TIPOS_BOLSA = [
    { valor: 'IC', rotulo: 'Iniciação Científica' },
    { valor: 'EXTENSAO', rotulo: 'Extensão' },
    { valor: 'MONITORIA', rotulo: 'Monitoria' },
    { valor: 'PIBID', rotulo: 'PIBID' },
    { valor: 'RESIDENCIA', rotulo: 'Residência' },
    { valor: 'OUTRO', rotulo: 'Outro' },
];

const LINHA_VAZIA = { id: null, tipo_bolsa: '', quantidade: 1, justificativa: '' };

// Aba "Demanda de Bolsa de Extensão": quantas bolsas o projeto pede, de cada
// tipo. Segue a forma das outras abas de lista, com o diálogo para incluir e
// editar. Cada tipo entra uma vez só; para pedir mais, muda-se a quantidade.
function DemandasBolsa({ projetoId, valor = [], onChange, errosValidacao }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const [edicao, setEdicao] = useState(null);

    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/demandas-bolsa/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar as demandas já cadastradas.'));
    }, [projetoId]);

    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function completa(linha) {
        return Boolean(linha.tipo_bolsa) && Number(linha.quantidade) >= 1;
    }

    // O backend recusa o mesmo tipo duas vezes no projeto, então a tela avisa antes.
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

        // Sem projeto gravado ainda, a demanda fica na lista e sobe junto no envio.
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

            <div className="table-responsive">
                <table className="table table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th scope="col" style={{ width: '4rem' }}>Nº</th>
                            <th scope="col">Tipo de bolsa</th>
                            <th scope="col" style={{ width: '8rem' }}>Quantidade</th>
                            <th scope="col">Justificativa</th>
                            <th scope="col" style={{ width: '7rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-muted text-center">
                                    Nenhuma bolsa pedida.
                                </td>
                            </tr>
                        )}
                        {linhas.map((linha, i) => (
                            <tr key={linha.id ?? `nova-${i}`}>
                                <td>{i + 1}.</td>
                                <td>{nomeTipo(linha)}</td>
                                <td>{linha.quantidade}</td>
                                <td>{linha.justificativa || <span className="text-muted">—</span>}</td>
                                <td className="text-nowrap">
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => abrirEdicao(i)}
                                            aria-label={`Editar a demanda ${i + 1}`}
                                            title="Editar"
                                        >
                                            <i className="bi bi-pencil" aria-hidden="true"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => excluir(i)}
                                            aria-label={`Excluir a demanda ${i + 1}`}
                                            title="Excluir"
                                        >
                                            <i className="bi bi-trash" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {linhas.length > 0 && (
                        <tfoot>
                            <tr>
                                <td colSpan={2} className="text-end fw-semibold">Total de bolsas</td>
                                <td className="fw-semibold">{total}</td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

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
        </fieldset>
    );
}

export default DemandasBolsa;
