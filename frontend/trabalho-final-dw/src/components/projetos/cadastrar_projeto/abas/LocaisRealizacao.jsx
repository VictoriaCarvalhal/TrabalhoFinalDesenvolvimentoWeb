import React, { useEffect, useRef, useState } from 'react';
import api from '../../../../services/api';
import { MUNICIPIOS_RJ } from '../../../../dados/municipiosRJ';
import CartaoItem from '../CartaoItem';
import ModalAlerta from '../../../comum/ModalAlerta';

function LocaisRealizacao({ projetoId, valor = [], onChange, errosValidacao }) {
    const [linhas, setLinhas] = useState(valor);
    const [erro, setErro] = useState(null);
    const gravandoLinha = useRef(new Set());
    const [exclusaoPendente, setExclusaoPendente] = useState(null);

    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/locais-realizacao/`)
            .then((r) => setLinhas((atuais) => [
                ...r.data,
                ...atuais.filter((l) => !l.id),
            ]))
            .catch(() => setErro('Não foi possível carregar os locais já cadastrados.'));
    }, [projetoId]);

    useEffect(() => {
        onChange?.(linhas);
    }, [linhas]); // eslint-disable-line react-hooks/exhaustive-deps

    function novaLinha() {
        setLinhas((atuais) => [...atuais, { id: null, nome_local: '', municipio: '' }]);
    }

    function editar(indice, campo, valorCampo) {
        setLinhas((atuais) => atuais.map((l, i) => (i === indice ? { ...l, [campo]: valorCampo } : l)));
    }

    async function gravar(indice, linhaForcada) {
        const linha = linhaForcada ?? linhas[indice];
        if (gravandoLinha.current.has(indice)) return;
        if (!projetoId || !linha.nome_local || !linha.municipio) return;
        gravandoLinha.current.add(indice);
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
        } finally {
            gravandoLinha.current.delete(indice);
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

    async function confirmarExclusao() {
        const indice = exclusaoPendente;
        setExclusaoPendente(null);
        if (indice !== null) await excluir(indice);
    }

    return (
        <fieldset>
            <legend>Locais de Realização</legend>

            <p className="small text-body-secondary mb-1">Os campos com * são obrigatórios.</p>
            <p className="small text-body-secondary">Use o botão abaixo para acrescentar um local.</p>

            {errosValidacao.locaisRealizacao && <div className="alert alert-danger py-2">{errosValidacao.locaisRealizacao}</div>}
            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={novaLinha}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo
            </button>

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {linhas.length === 0 ? (
                <p className="text-muted">Nenhum local cadastrado.</p>
            ) : (
                <div className="row g-3">
                    {linhas.map((linha, i) => (
                        <CartaoItem
                            key={linha.id ?? `nova-${i}`}
                            titulo={linha.nome_local || `Local ${i + 1}`}
                            acoes={
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => setExclusaoPendente(i)}
                                    aria-label={`Excluir local ${i + 1}`}
                                    title="Excluir"
                                >
                                    <i className="bi bi-trash me-1" aria-hidden="true"></i>Excluir
                                </button>
                            }
                        >
                            <div className="mb-2">
                                <label className="form-label" htmlFor={`lr-instituicao-${i}`}>Instituição *</label>
                                <input
                                    id={`lr-instituicao-${i}`}
                                    type="text"
                                    className="form-control"
                                    value={linha.nome_local}
                                    maxLength={255}
                                    required
                                    onChange={(e) => editar(i, 'nome_local', e.target.value)}
                                    onBlur={() => gravar(i)}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor={`lr-municipio-${i}`}>Município *</label>
                                <select
                                    id={`lr-municipio-${i}`}
                                    className="form-select"
                                    value={linha.municipio}
                                    required
                                    onChange={(e) => {
                                        const novoMunicipio = e.target.value;
                                        editar(i, 'municipio', novoMunicipio);
                                        if (novoMunicipio && linha.nome_local) {
                                            gravar(i, { ...linha, municipio: novoMunicipio });
                                        }
                                    }}
                                    onBlur={() => gravar(i)}
                                >
                                    <option value="">[Selecione]</option>
                                    {MUNICIPIOS_RJ.map((m) => (
                                        <option key={m.codigo} value={m.codigo}>
                                            {m.nome}
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
                    titulo="Excluir local?"
                    mensagem={`Excluir o local "${linhas[exclusaoPendente].nome_local || `Local ${exclusaoPendente + 1}`}"? Esta ação não pode ser desfeita.`}
                    textoConfirmar="Excluir"
                    aoConfirmar={confirmarExclusao}
                    aoFechar={() => setExclusaoPendente(null)}
                />
            )}
        </fieldset>
    );
}

export default LocaisRealizacao;
