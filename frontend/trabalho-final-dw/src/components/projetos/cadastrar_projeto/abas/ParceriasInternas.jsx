import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import CampoTextoLongo from '../CampoTextoLongo';

function ParceriasInternas({ projetoId, atualizarCampo, unidades, departamentos, valor=[], onChange}) {

    const [parceria, setParceria] = useState(valor);
    const [erro, setErro] = useState(null);
    //const [ativo, setAtivo] = useState({});

    // Com projeto, as linhas gravadas vêm da API.
    useEffect(() => {
        if (!projetoId) return;
        api.get(`/projetos/${projetoId}/parcerias-internas/`)
            .then((r) => setParceria(r.data))
            .catch(() => setErro('Não foi possível carregar os locais já cadastrados.'));
    }, [projetoId]);

    // Toda mudança nas linhas sobe pra página que hospeda a aba.
        useEffect(() => {
            onChange?.(parceria);
        }, [parceria]); // eslint-disable-line react-hooks/exhaustive-deps
    

    function novaParceria(){
        setParceria((atuais) => [...atuais, 
            {id: null, area: '', sigla: '', unidade: '', departamento: '', participacao: '' }]);
    }

    function editar(indice, campo, valorCampo){
        setParceria((atuais) => atuais.map((l,i) => (i===indice ? {...l, [campo]: valorCampo } : l)));
    }
    
    async function excluir(indice) {
            const parcerias = parceria[indice];
            if (projetoId && parcerias.id) {
                try {
                    await api.delete(`/projetos/${projetoId}/parcerias-internas/${parcerias.id}/`);
                } catch {
                    setErro('Erro ao excluir o local.');
                    return;
                }
            }
            setParceria((atuais) => atuais.filter((_, i) => i !== indice));
        }


    return (
        <fieldset>
            <legend>
                Parcerias Internas
            </legend>

            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={novaParceria}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo
            </button>

            {parceria.map((parcerias,i) => (
                <div key={parcerias.id ?? `nova-${i}`}>
                    <div>Parceria {i+1}</div>

                    <button 
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => excluir(i)}
                    
                    >
                       <i className="bi bi-trash" aria-hidden="true"></i> 
                    </button>
                    
                    
                    <div className="mb-3">
                        <label className="form-label">Nome da Instituição</label>
                        <input
                        type="text"
                        className="form-control"
                        value={parcerias.area}
                        onChange={(e) => editar(i ,"area", e.target.value)}
                        required
                        />
                    </div>
                

                    <div className="mb-3">
                        <label className="form-label">Sigla da Intituição</label>
                        <input
                        type="text"
                        className="form-control"
                        value={parcerias.sigla}
                        onChange={(e) => editar(i,"sigla", e.target.value)}
                        required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Unidade</label><br/>
                        <select
                            className="form-select"
                            value={parcerias.unidade}
                            onChange={(e) => editar(i,"unidade", e.target.value)}
                            required
                        >
                            <option value="">Selecione uma unidade</option>

                            {unidades.map((unidade) => (
                                <option key={unidade.id} value={unidade.id}>
                                    {unidade.sigla} — {unidade.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Departamento</label>

                        <select
                            className="form-select"
                            value={parcerias.departamento}
                            onChange={(e) =>
                                editar(i,"departamento", e.target.value)
                            }
                            required
                        >
                            <option value="">
                                Selecione um departamento
                            </option>

                            {departamentos.map((departamento) => (
                                <option
                                    key={departamento.id}
                                    value={departamento.id}
                                >
                                    {departamento.unidade_sigla} — {departamento.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <CampoTextoLongo
                        rotulo="Participação da unidade no projeto"
                        ajuda="Descreva de que forma essa unidade colabora: o que ela oferece ao projeto (pessoas, espaço, equipamento, dados) e em quais atividades participa."
                        campo="participacao_interna"
                        limite={500}
                        linhas={4}
                        valor={parcerias.participacao_interna}
                        aoMudar={atualizarCampo}
                        required
                    />
                    <button type="button" className="btn btn-sm btn-primary mb-3" onClick={() => gravar(i)}>
                        <i className="bi bi-floppy me-1" aria-hidden="true"></i>Adicionar Parceria
                    </button>

                
                </div>

            ))}


        </fieldset>
    );
}

export default ParceriasInternas;
