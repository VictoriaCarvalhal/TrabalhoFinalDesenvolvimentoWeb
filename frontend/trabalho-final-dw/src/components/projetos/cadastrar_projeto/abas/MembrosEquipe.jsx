import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import DialogoFormulario from '../DialogoFormulario';
import CartaoItem, { DetalheItem } from '../CartaoItem';

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

const MEMBRO_VAZIO = {
    id: null, vinculo: null, nome: '', cpf: '', matricula: '',
    tipo_vinculo: '', tipo_vinculo_display: '', funcao: '',
};

// Deixa o CPF no formato 000.000.000-00 (só para exibir).
function mascaraCpf(valor) {
    const nums = (valor || '').replace(/\D/g, '');
    if (nums.length !== 11) return valor || '';
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

// Aba "Membros da Equipe". Segue a forma das outras abas de lista: a tabela
// só mostra quem já está na equipe e o cadastro é feito no diálogo.
// No diálogo a pessoa é achada pela matrícula ou CPF, ou pelo tipo de vínculo.
function MembrosEquipe({ projetoId, coordenador, valor = [], onChange }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const [edicao, setEdicao] = useState(null);

    // Busca de pessoa dentro do diálogo
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [sugestoes, setSugestoes] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [erroDialogo, setErroDialogo] = useState(null);

    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/membros-equipe/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar a equipe já cadastrada.'));
    }, [projetoId]);

    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function limparBusca() {
        setBusca('');
        setFiltroTipo('');
        setSugestoes([]);
        setErroDialogo(null);
    }

    function abrirNovo() {
        limparBusca();
        setEdicao({ indice: null, dados: { ...MEMBRO_VAZIO } });
    }

    function abrirEdicao(indice) {
        limparBusca();
        setEdicao({ indice, dados: { ...linhas[indice] } });
    }

    function mudarCampo(mudancas) {
        setEdicao((atual) => ({ ...atual, dados: { ...atual.dados, ...mudancas } }));
    }

    // A filtragem é feita no backend: /dominios/vinculos/?q=...&tipo=...
    async function buscarPessoa(tipo = filtroTipo) {
        const termo = busca.trim();
        setSugestoes([]);
        setErroDialogo(null);
        if (!termo && !tipo) return;

        setBuscando(true);
        try {
            const params = new URLSearchParams();
            if (termo) params.append('q', termo);
            if (tipo) params.append('tipo', tipo);

            const resposta = await api.get(`/dominios/vinculos/?${params.toString()}`);
            const encontrados = resposta.data;

            if (encontrados.length === 0) {
                setErroDialogo('Nenhuma pessoa encontrada.');
            } else if (encontrados.length === 1) {
                selecionarPessoa(encontrados[0]);
            } else {
                setSugestoes(encontrados);
            }
        } catch {
            setErroDialogo('Erro ao buscar pessoa. Tente novamente.');
        } finally {
            setBuscando(false);
        }
    }

    // Ao escolher o tipo de vínculo a busca já roda, sem precisar clicar em Buscar.
    function trocarTipo(tipo) {
        setFiltroTipo(tipo);
        buscarPessoa(tipo);
    }

    function selecionarPessoa(vinculo) {
        mudarCampo({
            vinculo: vinculo.id,
            nome: vinculo.nome_completo,
            cpf: vinculo.cpf || '',
            matricula: vinculo.matricula || '',
            tipo_vinculo: vinculo.tipo_vinculo,
            tipo_vinculo_display: vinculo.tipo_vinculo_display,
        });
        setSugestoes([]);
    }

    function trocarPessoa() {
        mudarCampo({
            vinculo: null, nome: '', cpf: '', matricula: '',
            tipo_vinculo: '', tipo_vinculo_display: '',
        });
        limparBusca();
    }

    function completo(membro) {
        return Boolean(membro.vinculo) && Boolean(membro.funcao);
    }

    // O backend recusa a mesma pessoa duas vezes no projeto, então a tela avisa antes.
    function pessoaRepetida(membro, indice) {
        return linhas.some((l, i) => i !== indice && l.vinculo === membro.vinculo);
    }

    async function salvar() {
        const { indice, dados } = edicao;
        if (!completo(dados)) return;
        if (pessoaRepetida(dados, indice)) {
            setErroDialogo('Esta pessoa já está na equipe.');
            return;
        }

        // Sem projeto gravado ainda, o membro fica na lista e sobe junto no envio.
        if (!projetoId) {
            setLinhas((atuais) => (indice === null
                ? [...atuais, dados]
                : atuais.map((l, i) => (i === indice ? dados : l))));
            setEdicao(null);
            return;
        }

        try {
            const corpo = { vinculo: dados.vinculo, funcao: dados.funcao };
            const resposta = dados.id
                ? await api.patch(`/projetos/${projetoId}/membros-equipe/${dados.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/membros-equipe/`, corpo);
            const gravado = { ...dados, ...resposta.data };
            setLinhas((atuais) => (indice === null
                ? [...atuais, gravado]
                : atuais.map((l, i) => (i === indice ? gravado : l))));
            setEdicao(null);
        } catch (err) {
            const detalhe = err.response?.data;
            setErroDialogo(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar o membro.');
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

    function nomeVinculo(linha) {
        if (linha.tipo_vinculo_display) return linha.tipo_vinculo_display;
        const t = TIPOS_VINCULO.find((x) => x.valor === linha.tipo_vinculo);
        return t ? t.rotulo : '—';
    }

    function nomeFuncao(linha) {
        const f = FUNCOES.find((x) => x.valor === linha.funcao);
        return f ? f.rotulo : '—';
    }

    const dados = edicao?.dados;

    return (
        <fieldset>
            <legend>Membros da Equipe</legend>

            <p className="small text-body-secondary">
                Pessoas que participam do projeto. Para incluir, procure pela matrícula
                ou CPF, ou escolha o tipo de vínculo para ver a lista.
            </p>

            {coordenador && (
                <p className="mb-2"><strong>Coordenador:</strong> {coordenador}</p>
            )}

            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={abrirNovo}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo membro
            </button>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {linhas.length === 0 ? (
                <p className="text-muted">Nenhum membro cadastrado.</p>
            ) : (
                <div className="row g-3">
                    {linhas.map((linha, i) => (
                        <CartaoItem
                            key={linha.id ?? `novo-${i}`}
                            titulo={linha.nome || `Membro ${i + 1}`}
                            acoes={
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                                        onClick={() => abrirEdicao(i)}
                                        aria-label={`Editar o membro ${i + 1}`}
                                        title="Editar"
                                    >
                                        <i className="bi bi-pencil d-block mb-1" aria-hidden="true"></i>Editar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger flex-grow-1"
                                        onClick={() => excluir(i)}
                                        aria-label={`Excluir o membro ${i + 1}`}
                                        title="Excluir"
                                    >
                                        <i className="bi bi-trash d-block mb-1" aria-hidden="true"></i>Excluir
                                    </button>
                                </>
                            }
                        >
                            <DetalheItem icone="bi-person-badge" rotulo="Tipo de vínculo" valor={nomeVinculo(linha)} />
                            <DetalheItem icone="bi-card-text" rotulo="Matrícula / CPF" valor={linha.matricula || mascaraCpf(linha.cpf)} />
                            <DetalheItem icone="bi-briefcase" rotulo="Cargo/Perfil" valor={nomeFuncao(linha)} />
                        </CartaoItem>
                    ))}
                </div>
            )}

            {edicao && (
                <DialogoFormulario
                    titulo={edicao.indice === null ? 'Novo membro da equipe' : 'Editar membro da equipe'}
                    aoSalvar={salvar}
                    aoFechar={() => setEdicao(null)}
                    salvarDesabilitado={!completo(dados)}
                    erro={erroDialogo}
                >
                    {!dados.vinculo ? (
                        <>
                            <div className="row g-2 align-items-end mb-2">
                                <div className="col-sm-5">
                                    <label className="form-label" htmlFor="me-busca">Matrícula ou CPF</label>
                                    <input
                                        id="me-busca"
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex: 202520402012"
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        onKeyDown={(e) => {
                                            // Enter aqui busca a pessoa em vez de salvar o diálogo
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                buscarPessoa();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-sm-5">
                                    <label className="form-label" htmlFor="me-tipo">Tipo de vínculo</label>
                                    <select
                                        id="me-tipo"
                                        className="form-select"
                                        value={filtroTipo}
                                        onChange={(e) => trocarTipo(e.target.value)}
                                    >
                                        <option value="">[Todos]</option>
                                        {TIPOS_VINCULO.map((t) => (
                                            <option key={t.valor} value={t.valor}>{t.rotulo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-sm-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary w-100"
                                        disabled={(!busca.trim() && !filtroTipo) || buscando}
                                        onClick={() => buscarPessoa()}
                                    >
                                        {buscando ? '...' : 'Buscar'}
                                    </button>
                                </div>
                            </div>

                            {sugestoes.length > 0 && (
                                <>
                                    <p className="small fw-semibold mb-1">Selecione a pessoa:</p>
                                    <div className="list-group" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        {sugestoes.map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                className="list-group-item list-group-item-action d-flex justify-content-between"
                                                onClick={() => selecionarPessoa(v)}
                                            >
                                                <span>{v.nome_completo}</span>
                                                <span className="text-muted">
                                                    {v.matricula || mascaraCpf(v.cpf)} — {v.tipo_vinculo_display}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="row g-2 mb-2">
                                <div className="col-sm-6">
                                    <label className="form-label" htmlFor="me-nome">Nome</label>
                                    <input id="me-nome" type="text" className="form-control" value={dados.nome} readOnly />
                                </div>
                                <div className="col-sm-3">
                                    <label className="form-label" htmlFor="me-vinculo">Tipo de vínculo</label>
                                    <input id="me-vinculo" type="text" className="form-control" value={nomeVinculo(dados)} readOnly />
                                </div>
                                {/* Quem tem matrícula mostra a matrícula; externo mostra o CPF */}
                                <div className="col-sm-3">
                                    <label className="form-label" htmlFor="me-documento">
                                        {dados.matricula ? 'Matrícula' : 'CPF'}
                                    </label>
                                    <input
                                        id="me-documento"
                                        type="text"
                                        className="form-control"
                                        value={dados.matricula || mascaraCpf(dados.cpf)}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <button type="button" className="btn btn-link btn-sm px-0 mb-3" onClick={trocarPessoa}>
                                Trocar pessoa
                            </button>

                            <div className="mb-3">
                                <label className="form-label" htmlFor="me-funcao">Cargo/Perfil *</label>
                                <select
                                    id="me-funcao"
                                    className="form-select"
                                    value={dados.funcao}
                                    required
                                    onChange={(e) => mudarCampo({ funcao: e.target.value })}
                                >
                                    <option value="">[Selecione]</option>
                                    {FUNCOES.map((f) => (
                                        <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </DialogoFormulario>
            )}
        </fieldset>
    );
}

export default MembrosEquipe;
