import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';

// Mesma lista do backend (core.VinculoInstitucional.TipoVinculo).
const TIPOS_VINCULO = [
    { valor: 'PROFESSOR_EFETIVO', rotulo: 'Professor Efetivo' },
    { valor: 'PROFESSOR_VISITANTE', rotulo: 'Professor Visitante' },
    { valor: 'PROFESSOR_SUBSTITUTO', rotulo: 'Professor Substituto/Convidado' },
    { valor: 'TECNICO_ADMINISTRATIVO', rotulo: 'Técnico-Administrativo' },
    { valor: 'ALUNO_GRADUACAO', rotulo: 'Aluno de Graduação Não Bolsista' },
    { valor: 'ALUNO_POS_GRADUACAO', rotulo: 'Aluno de Pós-Graduação' },
    { valor: 'EXTERNO', rotulo: 'Externo' },
];

// Mesma lista do backend (projetos.FuncaoMembroEquipe). É o "Cargo/Perfil".
const FUNCOES = [
    { valor: 'COORDENADOR', rotulo: 'Coordenador(a)' },
    { valor: 'VICE_COORDENADOR', rotulo: 'Vice-Coordenador(a)' },
    { valor: 'DOCENTE_COLABORADOR', rotulo: 'Docente Colaborador(a)' },
    { valor: 'TECNICO', rotulo: 'Técnico(a)' },
    { valor: 'BOLSISTA', rotulo: 'Bolsista' },
    { valor: 'VOLUNTARIO', rotulo: 'Voluntário(a)' },
    { valor: 'DISCENTE', rotulo: 'Discente' },
];

const LINHA_VAZIA = {
    id: null, vinculo: null, tipo_vinculo: '', matricula: '', cpf: '', nome: '', funcao: '',
};

// Aba "Membros da Equipe" do cadastro de projeto. Como no sistema original:
// "Novo" abre uma linha, escolhe-se o tipo de vínculo, digita-se a matrícula
// e o "Pesquisar" abre a janela "Seleção", que lista as pessoas cadastradas.
// Clicar numa pessoa preenche a linha. Depois é só escolher o cargo/perfil.
//
// Sem projetoId as linhas ficam na memória e sobem pelo onChange; com
// projetoId cada linha vai pra /projetos/<id>/membros-equipe/ na hora.
function MembrosEquipe({ projetoId, coordenador, valor = [], onChange }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);

    // Estado da janela de seleção: qual linha está pesquisando e o resultado.
    const [pesquisa, setPesquisa] = useState(null);
    const [resultado, setResultado] = useState([]);
    const [pesquisando, setPesquisando] = useState(false);

    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/membros-equipe/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar a equipe já cadastrada.'));
    }, [projetoId]);

    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function novaLinha() {
        setLinhas((atuais) => [...atuais, { ...LINHA_VAZIA }]);
    }

    function editar(indice, mudancas) {
        setLinhas((atuais) => atuais.map((l, i) => (i === indice ? { ...l, ...mudancas } : l)));
    }

    // Trocar o tipo de vínculo limpa a pessoa, porque a pesquisa é por tipo.
    function trocarTipo(indice, tipo) {
        editar(indice, { tipo_vinculo: tipo, vinculo: null, matricula: '', cpf: '', nome: '' });
    }

    async function gravar(indice, linha) {
        if (!projetoId || !linha.vinculo || !linha.funcao) return;
        try {
            setErro(null);
            const corpo = { vinculo: linha.vinculo, funcao: linha.funcao };
            const resposta = linha.id
                ? await api.patch(`/projetos/${projetoId}/membros-equipe/${linha.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/membros-equipe/`, corpo);
            // A API devolve a linha completa, com CPF e nome vindos do cadastro.
            editar(indice, resposta.data);
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar o membro.');
        }
    }

    async function excluir(indice) {
        const linha = linhas[indice];
        if (projetoId && linha.id) {
            try {
                await api.delete(`/projetos/${projetoId}/membros-equipe/${linha.id}/`);
            } catch {
                setErro('Erro ao excluir o membro.');
                return;
            }
        }
        setLinhas((atuais) => atuais.filter((_, i) => i !== indice));
    }

    // Abre a janela "Seleção" pra linha e já pesquisa com o que foi digitado.
    async function abrirPesquisa(indice) {
        const linha = linhas[indice];
        setPesquisa({ indice, matricula: linha.matricula, tipo_vinculo: linha.tipo_vinculo });
        await pesquisar(linha.matricula, linha.tipo_vinculo);
    }

    // A lista de vínculos é pequena, então o filtro é feito aqui no front:
    // por tipo de vínculo e por começo da matrícula ou pedaço do nome.
    async function pesquisar(matricula, tipo) {
        setPesquisando(true);
        try {
            const resposta = await api.get('/dominios/vinculos/');
            const termo = (matricula ?? '').trim().toLowerCase();
            setResultado(resposta.data.filter((v) => {
                const tipoOk = !tipo || v.tipo_vinculo === tipo;
                const termoOk = !termo
                    || (v.matricula ?? '').toLowerCase().startsWith(termo)
                    || (v.nome_completo ?? '').toLowerCase().includes(termo);
                return tipoOk && termoOk;
            }));
        } catch {
            setErro('Não foi possível pesquisar as pessoas cadastradas.');
            setResultado([]);
        } finally {
            setPesquisando(false);
        }
    }

    function selecionar(vinculo) {
        const indice = pesquisa.indice;
        const jaEsta = linhas.some((l, i) => i !== indice && l.vinculo === vinculo.id);
        if (jaEsta) {
            setErro('Esta pessoa já está na equipe.');
            setPesquisa(null);
            return;
        }
        const mudancas = {
            vinculo: vinculo.id,
            tipo_vinculo: vinculo.tipo_vinculo,
            matricula: vinculo.matricula ?? '',
            nome: vinculo.nome_completo,
        };
        editar(indice, mudancas);
        setPesquisa(null);
        gravar(indice, { ...linhas[indice], ...mudancas });
    }

    function trocarFuncao(indice, funcao) {
        editar(indice, { funcao });
        gravar(indice, { ...linhas[indice], funcao });
    }

    return (
        <fieldset>
            <legend>Membros da Equipe</legend>

            <p className="small">
                Para <strong>inserir</strong> um membro de equipe, clique no botão 'Novo'. Na nova linha,
                selecione primeiro o tipo de vínculo, digite a matrícula e clique em 'Pesquisar'.
                Para <strong>alterar</strong> o tipo de vínculo, exclua o membro e insira novamente.
                Para <strong>excluir</strong>, clique na lixeira da linha.
            </p>

            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={novaLinha}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo
            </button>

            {coordenador && (
                <p className="mb-2"><strong>Coordenador:</strong> {coordenador}</p>
            )}

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
                            <th scope="col">Tipo de Vínculo</th>
                            <th scope="col">Número da Matrícula</th>
                            <th scope="col">CPF</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Cargo/Perfil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-muted text-center">
                                    Nenhum membro cadastrado.
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
                                        aria-label={`Excluir membro ${i + 1}`}
                                    >
                                        <i className="bi bi-trash" aria-hidden="true"></i>
                                    </button>
                                </td>
                                <td>
                                    {!linha.tipo_vinculo && (
                                        <div className="small text-danger fw-bold">SELECIONE O VÍNCULO</div>
                                    )}
                                    <select
                                        className="form-select form-select-sm"
                                        value={linha.tipo_vinculo}
                                        disabled={Boolean(linha.vinculo)}
                                        aria-label={`Tipo de vínculo do membro ${i + 1}`}
                                        onChange={(e) => trocarTipo(i, e.target.value)}
                                    >
                                        <option value="">[Selecione]</option>
                                        {TIPOS_VINCULO.map((t) => (
                                            <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    {linha.tipo_vinculo && !linha.vinculo && (
                                        <div className="small text-danger fw-bold">SELECIONE A MATRÍCULA</div>
                                    )}
                                    <div className="input-group input-group-sm">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={linha.matricula}
                                            readOnly={Boolean(linha.vinculo)}
                                            disabled={!linha.tipo_vinculo}
                                            aria-label={`Matrícula do membro ${i + 1}`}
                                            onChange={(e) => editar(i, { matricula: e.target.value })}
                                        />
                                        {!linha.vinculo && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                disabled={!linha.tipo_vinculo}
                                                onClick={() => abrirPesquisa(i)}
                                            >
                                                Pesquisar
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td>{linha.cpf || <span className="text-muted">-</span>}</td>
                                <td>{linha.nome || <span className="text-muted">-</span>}</td>
                                <td>
                                    <select
                                        className="form-select form-select-sm"
                                        value={linha.funcao}
                                        disabled={!linha.vinculo}
                                        aria-label={`Cargo ou perfil do membro ${i + 1}`}
                                        onChange={(e) => trocarFuncao(i, e.target.value)}
                                    >
                                        <option value="">[Selecione]</option>
                                        {FUNCOES.map((f) => (
                                            <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Janela "Seleção", igual à do sistema original. */}
            {pesquisa && (
                <div
                    className="modal d-block"
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="titulo-selecao"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="titulo-selecao">Seleção</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fechar"
                                    onClick={() => setPesquisa(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="fw-bold small mb-2">Membro Equipe</p>
                                <form
                                    className="row g-2 align-items-end mb-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        pesquisar(pesquisa.matricula, pesquisa.tipo_vinculo);
                                    }}
                                >
                                    <div className="col-sm-5">
                                        <label htmlFor="selecao-matricula" className="form-label">Matrícula ou nome</label>
                                        <input
                                            id="selecao-matricula"
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={pesquisa.matricula}
                                            onChange={(e) => setPesquisa({ ...pesquisa, matricula: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-sm-5">
                                        <label htmlFor="selecao-tipo" className="form-label">Tipo de Vínculo</label>
                                        <select
                                            id="selecao-tipo"
                                            className="form-select form-select-sm"
                                            value={pesquisa.tipo_vinculo}
                                            onChange={(e) => setPesquisa({ ...pesquisa, tipo_vinculo: e.target.value })}
                                        >
                                            <option value="">[Todos]</option>
                                            {TIPOS_VINCULO.map((t) => (
                                                <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-sm-2">
                                        <button type="submit" className="btn btn-sm btn-primary w-100">
                                            <i className="bi bi-search me-1" aria-hidden="true"></i>Pesquisar
                                        </button>
                                    </div>
                                </form>

                                <p className="fw-bold small mb-2">Seleção Membro Equipe</p>
                                <table className="table table-sm table-hover">
                                    <thead className="table-info">
                                        <tr>
                                            <th scope="col">Matrícula</th>
                                            <th scope="col">Nome</th>
                                            <th scope="col">Tipo de Vínculo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pesquisando && (
                                            <tr><td colSpan={3} className="text-muted">Pesquisando...</td></tr>
                                        )}
                                        {!pesquisando && resultado.length === 0 && (
                                            <tr><td colSpan={3} className="text-muted">Nenhuma pessoa encontrada.</td></tr>
                                        )}
                                        {!pesquisando && resultado.map((v) => (
                                            <tr key={v.id}>
                                                <td colSpan={3} className="p-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link text-start w-100 text-decoration-none d-flex"
                                                        onClick={() => selecionar(v)}
                                                    >
                                                        <span className="flex-fill">{v.matricula || '-'}</span>
                                                        <span className="flex-fill">{v.nome_completo}</span>
                                                        <span className="flex-fill">{v.tipo_vinculo_display}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </fieldset>
    );
}

export default MembrosEquipe;
