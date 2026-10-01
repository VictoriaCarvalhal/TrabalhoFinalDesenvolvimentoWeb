import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import CampoTextoLongo from '../CampoTextoLongo';
import DialogoFormulario from '../DialogoFormulario';

const LINHA_VAZIA = {
    id: null, unidade: '', departamento: '', nome_instituicao: '', sigla_instituicao: '', participacao: '',
};

// Parcerias internas: a aba só lista o que já foi cadastrado e o
// preenchimento acontece num diálogo, igual às outras abas de lista. Assim a
// tabela não acumula as duas tarefas, mostrar e editar, e cada parceria fica
// resumida a uma linha depois de salva.
function ParceriasInternas({ projetoId, unidades, departamentos, valor = [], onChange }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);

    // Rascunho do diálogo: null = fechado. indice null = parceria nova.
    const [edicao, setEdicao] = useState(null);

    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/parcerias-internas/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar as parcerias já cadastradas.'));
    }, [projetoId]);

    // Toda mudança nas linhas sobe pra página que hospeda a aba.
    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    // Dois campos obrigatórios: unidade e os dados da instituição. O
    // departamento é opcional no modelo, então não entra na checagem.
    function completa(linha) {
        return Boolean(linha.unidade && linha.nome_instituicao && linha.sigla_instituicao);
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
                unidade: dados.unidade,
                // A API espera null, e não string vazia, quando não há departamento.
                departamento: dados.departamento || null,
                nome_instituicao: dados.nome_instituicao,
                sigla_instituicao: dados.sigla_instituicao,
                participacao: dados.participacao,
            };
            const resposta = dados.id
                ? await api.patch(`/projetos/${projetoId}/parcerias-internas/${dados.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/parcerias-internas/`, corpo);
            const gravada = { ...dados, id: resposta.data.id };
            setLinhas((atuais) => (indice === null
                ? [...atuais, gravada]
                : atuais.map((l, i) => (i === indice ? gravada : l))));
            setEdicao(null);
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar a parceria interna.');
        }
    }

    async function excluir(indice) {
        const linha = linhas[indice];
        if (projetoId && linha.id) {
            try {
                await api.delete(`/projetos/${projetoId}/parcerias-internas/${linha.id}/`);
            } catch {
                setErro('Erro ao excluir a parceria interna.');
                return;
            }
        }
        setLinhas((atuais) => atuais.filter((_, i) => i !== indice));
    }

    // Nome por extenso das chaves estrangeiras, para a linha da lista. A API
    // devolve esses nomes no GET, mas uma parceria recém-digitada só tem o id.
    function nomeUnidade(linha) {
        if (linha.unidade_sigla) return linha.unidade_sigla;
        const u = unidades.find((x) => String(x.id) === String(linha.unidade));
        return u ? u.sigla : '—';
    }

    function nomeDepartamento(linha) {
        if (linha.departamento_nome) return linha.departamento_nome;
        const d = departamentos.find((x) => String(x.id) === String(linha.departamento));
        return d ? d.nome : '—';
    }

    const dados = edicao?.dados;

    return (
        <fieldset>
            <legend>Parcerias Internas</legend>

            <p className="small text-body-secondary">
                Unidades da própria universidade que colaboram com o projeto.
                Use o botão abaixo para acrescentar uma.
            </p>

            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={abrirNova}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Nova parceria interna
            </button>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            <div className="table-responsive">
                <table className="table table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th scope="col" style={{ width: '4rem' }}>Nº</th>
                            <th scope="col">Instituição</th>
                            <th scope="col">Unidade</th>
                            <th scope="col">Departamento</th>
                            <th scope="col" style={{ width: '7rem' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-muted text-center">
                                    Nenhuma parceria interna cadastrada.
                                </td>
                            </tr>
                        )}
                        {linhas.map((linha, i) => (
                            <tr key={linha.id ?? `nova-${i}`}>
                                <td>{i + 1}.</td>
                                <td>
                                    {linha.nome_instituicao}
                                    {linha.sigla_instituicao && ` (${linha.sigla_instituicao})`}
                                </td>
                                <td>{nomeUnidade(linha)}</td>
                                <td>{nomeDepartamento(linha)}</td>
                                <td className="text-nowrap">
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => abrirEdicao(i)}
                                            aria-label={`Editar a parceria interna ${i + 1}`}
                                            title="Editar"
                                        >
                                            <i className="bi bi-pencil" aria-hidden="true"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => excluir(i)}
                                            aria-label={`Excluir a parceria interna ${i + 1}`}
                                            title="Excluir"
                                        >
                                            <i className="bi bi-trash" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {edicao && (
                <DialogoFormulario
                    titulo={edicao.indice === null ? 'Nova parceria interna' : 'Editar parceria interna'}
                    aoSalvar={salvar}
                    aoFechar={() => setEdicao(null)}
                    salvarDesabilitado={!completa(dados)}
                >
                    <div className="mb-3">
                        <label className="form-label" htmlFor="pi-nome">Nome da instituição *</label>
                        <input
                            id="pi-nome"
                            type="text"
                            className="form-control"
                            value={dados.nome_instituicao}
                            maxLength={255}
                            required
                            onChange={(e) => mudarCampo({ nome_instituicao: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="pi-sigla">Sigla da instituição *</label>
                        <input
                            id="pi-sigla"
                            type="text"
                            className="form-control"
                            value={dados.sigla_instituicao}
                            maxLength={50}
                            required
                            onChange={(e) => mudarCampo({ sigla_instituicao: e.target.value })}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="pi-unidade">Unidade *</label>
                        <select
                            id="pi-unidade"
                            className="form-select"
                            value={dados.unidade}
                            required
                            // Trocar a unidade limpa o departamento: o antigo é de outra unidade.
                            onChange={(e) => mudarCampo({ unidade: e.target.value, departamento: '' })}
                        >
                            <option value="">[Selecione]</option>
                            {unidades.map((unidade) => (
                                <option key={unidade.id} value={unidade.id}>
                                    {unidade.sigla} — {unidade.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="pi-departamento">Departamento</label>
                        <select
                            id="pi-departamento"
                            className="form-select"
                            value={dados.departamento ?? ''}
                            disabled={!dados.unidade}
                            onChange={(e) => mudarCampo({ departamento: e.target.value })}
                        >
                            <option value="">
                                {dados.unidade ? '[Selecione]' : 'Escolha uma unidade primeiro'}
                            </option>
                            {departamentos
                                .filter((d) => String(d.unidade) === String(dados.unidade))
                                .map((departamento) => (
                                    <option key={departamento.id} value={departamento.id}>
                                        {departamento.nome}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <CampoTextoLongo
                        rotulo="Participação da unidade no projeto"
                        ajuda="Descreva de que forma essa unidade colabora: o que ela oferece ao projeto (pessoas, espaço, equipamento, dados) e em quais atividades participa."
                        campo="participacao"
                        limite={500}
                        linhas={4}
                        valor={dados.participacao ?? ''}
                        aoMudar={(campo, texto) => mudarCampo({ [campo]: texto })}
                    />
                </DialogoFormulario>
            )}
        </fieldset>
    );
}

export default ParceriasInternas;
