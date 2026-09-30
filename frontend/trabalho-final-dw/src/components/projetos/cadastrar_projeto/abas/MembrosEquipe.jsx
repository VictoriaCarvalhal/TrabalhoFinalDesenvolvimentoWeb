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
    id: null, vinculo: null, tipo_vinculo: '', matricula: '', cpf: '',
    nome: '', funcao: '', busca: '', filtroTipo: '',
};

// Máscara de CPF pra exibição: 123.456.789-00
function mascaraCpf(valor) {
    const nums = (valor || '').replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return nums.slice(0, 3) + '.' + nums.slice(3);
    if (nums.length <= 9) return nums.slice(0, 3) + '.' + nums.slice(3, 6) + '.' + nums.slice(6);
    return nums.slice(0, 3) + '.' + nums.slice(3, 6) + '.' + nums.slice(6, 9) + '-' + nums.slice(9);
}

// Aba "Membros da Equipe" do cadastro de projeto.
// O usuário pode filtrar por tipo de vínculo e/ou digitar matrícula/CPF/nome.
// O sistema mostra as pessoas encontradas pra ele escolher.
function MembrosEquipe({ projetoId, coordenador, valor = [], onChange }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const [buscando, setBuscando] = useState({});
    const [sugestoes, setSugestoes] = useState({});

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

    async function gravar(indice, linha) {
        if (!projetoId || !linha.vinculo || !linha.funcao) return;
        try {
            setErro(null);
            const corpo = { vinculo: linha.vinculo, funcao: linha.funcao };
            const resposta = linha.id
                ? await api.patch(`/projetos/${projetoId}/membros-equipe/${linha.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/membros-equipe/`, corpo);
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
        setSugestoes((a) => { const novo = { ...a }; delete novo[indice]; return novo; });
    }

    // Busca pelo tipo de vínculo e/ou texto digitado (matrícula ou CPF).
    async function buscarPessoa(indice, novoFiltro = null) {
        const linha = linhas[indice];
        const termo = (linha.busca || '').trim();
        const filtroTipo = novoFiltro !== null ? novoFiltro : (linha.filtroTipo || '');

        // Precisa ter pelo menos um filtro
        if (!termo && !filtroTipo) return;

        setBuscando((a) => ({ ...a, [indice]: true }));
        setErro(null);
        setSugestoes((a) => ({ ...a, [indice]: [] }));

        try {
            const resposta = await api.get('/dominios/vinculos/');
            const termoLower = termo.toLowerCase();
            const termoDigitos = termo.replace(/\D/g, '');

            const encontrados = resposta.data.filter((v) => {
                // Filtro por tipo de vínculo (se selecionou)
                if (filtroTipo && v.tipo_vinculo !== filtroTipo) return false;

                // Se não digitou nada no campo texto, aceita todos do tipo
                if (!termo) return true;

                const matriculaOk = v.matricula
                    && v.matricula.toLowerCase().includes(termoLower);
                // CPF: compara só os dígitos
                const cpfOk = termoDigitos.length >= 3
                    && v.cpf
                    && v.cpf.replace(/\D/g, '').includes(termoDigitos);
                return matriculaOk || cpfOk;
            });

            if (encontrados.length === 0) {
                setErro('Nenhuma pessoa encontrada. Verifique os filtros.');
            } else if (encontrados.length === 1) {
                selecionarPessoa(indice, encontrados[0]);
            } else {
                setSugestoes((a) => ({ ...a, [indice]: encontrados }));
            }
        } catch {
            setErro('Erro ao buscar pessoa. Tente novamente.');
        } finally {
            setBuscando((a) => ({ ...a, [indice]: false }));
        }
    }

    function selecionarPessoa(indice, vinculo) {
        const jaEsta = linhas.some((l, i) => i !== indice && l.vinculo === vinculo.id);
        if (jaEsta) {
            setErro('Esta pessoa já está na equipe.');
            return;
        }

        const dadosPreenchidos = {
            vinculo: vinculo.id,
            tipo_vinculo: vinculo.tipo_vinculo,
            matricula: vinculo.matricula || '',
            cpf: vinculo.cpf || '',
            nome: vinculo.nome_completo,
        };
        editar(indice, dadosPreenchidos);
        setSugestoes((a) => { const novo = { ...a }; delete novo[indice]; return novo; });

        const linha = linhas[indice];
        if (linha.funcao) {
            gravar(indice, { ...linha, ...dadosPreenchidos });
        }
    }

    function limparPessoa(indice) {
        editar(indice, {
            vinculo: null, tipo_vinculo: '', matricula: '', cpf: '',
            nome: '', busca: '', filtroTipo: '',
        });
    }

    function trocarFuncao(indice, funcao) {
        editar(indice, { funcao });
        gravar(indice, { ...linhas[indice], funcao });
    }

    function rotuloVinculo(valor) {
        const tipo = TIPOS_VINCULO.find((t) => t.valor === valor);
        return tipo ? tipo.rotulo : valor;
    }

    return (
        <fieldset>
            <legend>Membros da Equipe</legend>

            <p className="small text-body-secondary">
                Clique em "Novo" para adicionar um membro. Filtre por tipo de vínculo
                e/ou digite a matrícula, CPF ou nome da pessoa.
            </p>

            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={novaLinha}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo
            </button>

            {coordenador && (
                <p className="mb-2"><strong>Coordenador:</strong> {coordenador}</p>
            )}

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {linhas.length === 0 && (
                <p className="text-muted">Nenhum membro cadastrado.</p>
            )}

            {linhas.map((linha, i) => (
                <div key={linha.id ?? `nova-${i}`} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Membro {i + 1}</strong>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => excluir(i)}
                        >
                            <i className="bi bi-trash me-1" aria-hidden="true"></i>Remover
                        </button>
                    </div>

                    {!linha.vinculo ? (
                        <>
                            <div className="row g-2 align-items-end">
                                <div className="col-sm-4">
                                    <label className="form-label">Matrícula ou CPF</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex: 202520402012"
                                        value={linha.busca || ''}
                                        onChange={(e) => editar(i, { busca: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarPessoa(i); } }}
                                    />
                                </div>
                                <div className="col-sm-4">
                                    <label className="form-label">Tipo de Vínculo</label>
                                    <select
                                        className="form-select"
                                        value={linha.filtroTipo || ''}
                                        onChange={(e) => {
                                            const novoValor = e.target.value;
                                            editar(i, { filtroTipo: novoValor });
                                            buscarPessoa(i, novoValor);
                                        }}
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
                                        disabled={(!linha.busca && !linha.filtroTipo) || buscando[i]}
                                        onClick={() => buscarPessoa(i)}
                                    >
                                        {buscando[i] ? 'Buscando...' : 'Buscar'}
                                    </button>
                                </div>
                            </div>

                            {/* Sugestões quando acha mais de uma pessoa */}
                            {sugestoes[i] && sugestoes[i].length > 0 && (
                                <div className="mt-2">
                                    <p className="small fw-bold mb-1">Selecione a pessoa:</p>
                                    <div className="list-group">
                                        {sugestoes[i].map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                className="list-group-item list-group-item-action d-flex justify-content-between"
                                                onClick={() => selecionarPessoa(i, v)}
                                            >
                                                <span>{v.nome_completo}</span>
                                                <span className="text-muted">
                                                    {v.matricula || mascaraCpf(v.cpf)} — {v.tipo_vinculo_display}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="row g-2 mb-2">
                                <div className="col-sm-4">
                                    <label className="form-label">Nome</label>
                                    <input type="text" className="form-control" value={linha.nome} readOnly />
                                </div>
                                <div className="col-sm-3">
                                    <label className="form-label">Tipo de Vínculo</label>
                                    <input type="text" className="form-control" value={rotuloVinculo(linha.tipo_vinculo)} readOnly />
                                </div>
                                {linha.matricula ? (
                                    <div className="col-sm-2">
                                        <label className="form-label">Matrícula</label>
                                        <input type="text" className="form-control" value={linha.matricula} readOnly />
                                    </div>
                                ) : (
                                    <div className="col-sm-2">
                                        <label className="form-label">CPF</label>
                                        <input type="text" className="form-control" value={mascaraCpf(linha.cpf)} readOnly />
                                    </div>
                                )}
                                <div className="col-sm-3">
                                    <label className="form-label">Cargo/Perfil</label>
                                    <select
                                        className="form-select"
                                        value={linha.funcao}
                                        onChange={(e) => trocarFuncao(i, e.target.value)}
                                    >
                                        <option value="">[Selecione]</option>
                                        {FUNCOES.map((f) => (
                                            <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => limparPessoa(i)}
                            >
                                <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>Trocar pessoa
                            </button>
                        </>
                    )}
                </div>
            ))}
        </fieldset>
    );
}

export default MembrosEquipe;
