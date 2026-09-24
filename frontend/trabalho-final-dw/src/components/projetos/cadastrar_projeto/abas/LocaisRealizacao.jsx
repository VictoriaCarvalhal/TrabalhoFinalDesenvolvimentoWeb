import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import { MUNICIPIOS_RJ } from '../../../../dados/municipiosRJ';

// Aba "Locais de Realização" do cadastro de projeto. Funciona como no sistema
// original: uma tabela vazia, o botão "Novo" acrescenta uma linha com
// Instituição e Município, e a lixeira apaga a linha.
//
// Enquanto o projeto ainda não foi criado (sem projetoId) as linhas ficam só
// na memória e sobem pelo onChange, pra página juntar tudo no salvar. Com o
// projetoId, cada linha é gravada na hora em /projetos/<id>/locais-realizacao/.
function LocaisRealizacao({ projetoId, valor = [], onChange }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);

    // Com projeto, as linhas gravadas vêm da API.
    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/locais-realizacao/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar os locais já cadastrados.'));
    }, [projetoId]);

    // Toda mudança nas linhas sobe pra página que hospeda a aba.
    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function novaLinha() {
        setLinhas((atuais) => [...atuais, { id: null, nome_local: '', municipio: '' }]);
    }

    function editar(indice, campo, valorCampo) {
        setLinhas((atuais) => atuais.map((l, i) => (i === indice ? { ...l, [campo]: valorCampo } : l)));
    }

    async function gravar(indice) {
        // Só grava quando os dois campos obrigatórios estão preenchidos.
        const linha = linhas[indice];
        if (!projetoId || !linha.nome_local || !linha.municipio) return;
        try {
            setErro(null);
            const corpo = { nome_local: linha.nome_local, municipio: linha.municipio };
            const resposta = linha.id
                ? await api.patch(`/projetos/${projetoId}/locais-realizacao/${linha.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/locais-realizacao/`, corpo);
            editar(indice, 'id', resposta.data.id);
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar o local.');
        }
    }

    async function excluir(indice) {
        const linha = linhas[indice];
        if (projetoId && linha.id) {
            try {
                await api.delete(`/projetos/${projetoId}/locais-realizacao/${linha.id}/`);
            } catch {
                setErro('Erro ao excluir o local.');
                return;
            }
        }
        setLinhas((atuais) => atuais.filter((_, i) => i !== indice));
    }

    return (
        <fieldset>
            <legend>Locais de Realização</legend>

            <p className="small text-danger mb-1">* Preenchimento obrigatório</p>
            <p className="fw-bold small">PARA INSERIR UM LOCAL DE REALIZAÇÃO, CLIQUE NO BOTÃO 'NOVO'.</p>

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
                            <th scope="col">* Instituição</th>
                            <th scope="col">* Município</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-muted text-center">
                                    Nenhum local cadastrado.
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
                                        aria-label={`Excluir local ${i + 1}`}
                                    >
                                        <i className="bi bi-trash" aria-hidden="true"></i>
                                    </button>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={linha.nome_local}
                                        maxLength={255}
                                        required
                                        aria-label={`Instituição do local ${i + 1}`}
                                        onChange={(e) => editar(i, 'nome_local', e.target.value)}
                                        onBlur={() => gravar(i)}
                                    />
                                </td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={linha.municipio}
                                        required
                                        aria-label={`Município do local ${i + 1}`}
                                        onChange={(e) => editar(i, 'municipio', e.target.value)}
                                        onBlur={() => gravar(i)}
                                    >
                                        <option value="">[Selecione]</option>
                                        {MUNICIPIOS_RJ.map((m) => (
                                            <option key={m.codigo} value={m.codigo}>
                                                {m.nome}
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

export default LocaisRealizacao;
