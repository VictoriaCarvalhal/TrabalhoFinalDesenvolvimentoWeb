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

function mascaraCpf(valor) {
    const nums = valor.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return nums.slice(0, 3) + '.' + nums.slice(3);
    if (nums.length <= 9) return nums.slice(0, 3) + '.' + nums.slice(3, 6) + '.' + nums.slice(6);
    return nums.slice(0, 3) + '.' + nums.slice(3, 6) + '.' + nums.slice(6, 9) + '-' + nums.slice(9);
}

function pareceCpf(texto) {
    const limpo = texto.replace(/\D/g, '');
    return limpo.length >= 3 && !/[a-zA-Z]/.test(texto);
}

function MembrosEquipe({ projetoId, coordenador, valor = [], onChange }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const [buscando, setBuscando] = useState({}); // { indice: true } enquanto busca

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
    }


    async function buscarPessoa(indice) {
        const linha = linhas[indice];
        const termo = (linha.busca || '').replace(/\D/g, '').trim();
        if (!termo) return;

        setBuscando((a) => ({ ...a, [indice]: true }));
        setErro(null);

        try {
            const resposta = await api.get('/dominios/vinculos/');
            const encontrado = resposta.data.find((v) => {
                const matriculaOk = v.matricula && v.matricula === termo;
                const cpfOk = v.cpf && v.cpf.replace(/\D/g, '') === termo;
                return matriculaOk || cpfOk;
            });

            if (!encontrado) {
                setErro('Nenhuma pessoa encontrada com essa matrícula ou CPF.');
                return;
            }

            const jaEsta = linhas.some((l, i) => i !== indice && l.vinculo === encontrado.id);
            if (jaEsta) {
                setErro('Esta pessoa já está na equipe.');
                return;
            }

            const dadosPreenchidos = {
                vinculo: encontrado.id,
                tipo_vinculo: encontrado.tipo_vinculo,
                matricula: encontrado.matricula || '',
                cpf: encontrado.cpf || '',
                nome: encontrado.nome_completo,
            };
            editar(indice, dadosPreenchidos);

            // Se já tem função selecionada, grava direto
            if (linha.funcao) {
                gravar(indice, { ...linha, ...dadosPreenchidos });
            }
        } catch {
            setErro('Erro ao buscar pessoa. Tente novamente.');
        } finally {
            setBuscando((a) => ({ ...a, [indice]: false }));
        }
    }

    // Quando muda o campo de busca, aplica máscara de CPF se necessário
    function aoDigitarBusca(indice, valor) {
        if (pareceCpf(valor) && valor.length > 3) {
            editar(indice, { busca: mascaraCpf(valor) });
        } else {
            editar(indice, { busca: valor });
        }
    }

    // Limpa a pessoa selecionada pra buscar outra
    function limparPessoa(indice) {
        editar(indice, {
            vinculo: null, tipo_vinculo: '', matricula: '', cpf: '', nome: '', busca: '',
        });
    }

    function trocarFuncao(indice, funcao) {
        editar(indice, { funcao });
        gravar(indice, { ...linhas[indice], funcao });
    }

    // Acha o rótulo legível do tipo de vínculo
    function rotuloVinculo(valor) {
        const tipo = TIPOS_VINCULO.find((t) => t.valor === valor);
        return tipo ? tipo.rotulo : valor;
    }

    return (
        <fieldset>
            <legend>Membros da Equipe</legend>

            <p className="small text-body-secondary">
                Clique em "Novo" para adicionar um membro. Digite a matrícula ou o CPF
                da pessoa e clique em "Buscar". O sistema preenche o nome e o vínculo
                automaticamente.
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

                    {/* Se ainda não encontrou a pessoa, mostra o campo de busca */}
                    {!linha.vinculo ? (
                        <div className="row g-2 align-items-end">
                            <div className="col-sm-6">
                                <label className="form-label">Matrícula ou CPF</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Digite a matrícula ou CPF"
                                    value={linha.busca || ''}
                                    onChange={(e) => aoDigitarBusca(i, e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarPessoa(i); } }}
                                />
                            </div>
                            <div className="col-sm-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary w-100"
                                    disabled={!linha.busca || buscando[i]}
                                    onClick={() => buscarPessoa(i)}
                                >
                                    {buscando[i] ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Pessoa encontrada: mostra os dados preenchidos */
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
                                        <input type="text" className="form-control" value={mascaraCpf(linha.cpf || '')} readOnly />
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
