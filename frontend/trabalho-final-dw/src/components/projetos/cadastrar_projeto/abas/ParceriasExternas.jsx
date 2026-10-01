import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';

// Lista copiada do backend (projetos.TipoInstituicaoExterna).
const TIPOS_INSTITUICAO = [
    { valor: 'GOV_FEDERAL', rotulo: 'Instituição Governamental Federal' },
    { valor: 'GOV_ESTADUAL', rotulo: 'Instituição Governamental Estadual' },
    { valor: 'GOV_MUNICIPAL', rotulo: 'Instituição Governamental Municipal' },
    { valor: 'INICIATIVA_PRIVADA', rotulo: 'Organização da Iniciativa Privada' },
    { valor: 'MOVIMENTO_SOCIAL', rotulo: 'Movimento Social' },
    { valor: 'ONG', rotulo: 'Organização Não Governamental' },
    { valor: 'OUTRO', rotulo: 'Outros' },
];

const LINHA_VAZIA = {
    id: null, nome_instituicao: '', sigla_instituicao: '', tipo_instituicao: '', participacao: '',
};

function ParceriasExternas({ projetoId, valor = [], onChange }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    
    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/parcerias-externas/`)
            .then((r) => setLinhas(r.data))
            .catch(() => setErro('Não foi possível carregar as parcerias já cadastradas.'));
    }, [projetoId]);

    // Toda mudança nas linhas sobe pra página que hospeda a aba.
    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function novaLinha() {
        setLinhas((atuais) => [...atuais, { ...LINHA_VAZIA }]);
    }

    function editar(indice, mudancas) {
        setLinhas((atuais) => atuais.map((l, i) => (i === indice ? { ...l, ...mudancas } : l)));
    }

    // A instituição e o tipo são obrigatórios no modelo
    function completa(linha) {
        return Boolean(linha.nome_instituicao && linha.tipo_instituicao);
    }

    async function gravar(indice, linha) {
        if (!projetoId || !completa(linha)) return;
        try {
            setErro(null);
            const corpo = {
                nome_instituicao: linha.nome_instituicao,
                sigla_instituicao: linha.sigla_instituicao,
                tipo_instituicao: linha.tipo_instituicao,
                participacao: linha.participacao,
            };
            const resposta = linha.id
                ? await api.patch(`/projetos/${projetoId}/parcerias-externas/${linha.id}/`, corpo)
                : await api.post(`/projetos/${projetoId}/parcerias-externas/`, corpo);
            editar(indice, { id: resposta.data.id });
        } catch (err) {
            const detalhe = err.response?.data;
            setErro(detalhe ? Object.values(detalhe).flat().join(' ') : 'Erro ao gravar a parceria externa.');
        }
    }

    async function excluir(indice) {
        const linha = linhas[indice];
        if (projetoId && linha.id) {
            try {
                await api.delete(`/projetos/${projetoId}/parcerias-externas/${linha.id}/`);
            } catch {
                setErro('Erro ao excluir a parceria externa.');
                return;
            }
        }
        setLinhas((atuais) => atuais.filter((_, i) => i !== indice));
    }

    return (
        <fieldset>
            <legend>Parcerias Externas</legend>

            <p className="small text-body-secondary mb-1">Os campos com * são obrigatórios.</p>
            <p className="small text-body-secondary">Use o botão abaixo para acrescentar uma parceria.</p>

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
                            <th scope="col">* Nome da Instituição</th>
                            <th scope="col">Sigla da Instituição</th>
                            <th scope="col">* Tipo de Instituição</th>
                            <th scope="col">Participação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-muted text-center">
                                    Nenhuma parceria externa cadastrada.
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
                                        aria-label={`Excluir parceria externa ${i + 1}`}
                                    >
                                        <i className="bi bi-trash" aria-hidden="true"></i>
                                    </button>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={linha.nome_instituicao}
                                        maxLength={255}
                                        required
                                        aria-label={`Nome da instituição da parceria externa ${i + 1}`}
                                        onChange={(e) => editar(i, { nome_instituicao: e.target.value })}
                                        onBlur={() => gravar(i, linha)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={linha.sigla_instituicao}
                                        maxLength={50}
                                        aria-label={`Sigla da instituição da parceria externa ${i + 1}`}
                                        onChange={(e) => editar(i, { sigla_instituicao: e.target.value })}
                                        onBlur={() => gravar(i, linha)}
                                    />
                                </td>
                                <td>
                                    <select
                                        className="form-select form-select-sm"
                                        value={linha.tipo_instituicao}
                                        required
                                        aria-label={`Tipo da instituição da parceria externa ${i + 1}`}
                                        onChange={(e) => editar(i, { tipo_instituicao: e.target.value })}
                                        onBlur={() => gravar(i, linha)}
                                    >
                                        <option value="">[Selecione]</option>
                                        {TIPOS_INSTITUICAO.map((tipo) => (
                                            <option key={tipo.valor} value={tipo.valor}>
                                                {tipo.rotulo}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={linha.participacao}
                                        maxLength={500}
                                        aria-label={`Participação da parceria externa ${i + 1}`}
                                        onChange={(e) => editar(i, { participacao: e.target.value })}
                                        onBlur={() => gravar(i, linha)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </fieldset>
    );
}

export default ParceriasExternas;
