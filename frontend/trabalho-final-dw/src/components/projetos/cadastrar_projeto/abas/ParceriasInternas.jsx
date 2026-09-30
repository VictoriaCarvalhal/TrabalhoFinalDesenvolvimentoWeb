import React, { useState } from 'react';
import CampoTextoLongo from '../CampoTextoLongo';

function ParceriasInternas({ form, atualizarCampo, unidades, departamentos, valor=[]}) {

    const [parceria, setParceria] = useState(valor);

    function novaParceria(){
        setParceria((atuais) => [...atuais, 
            {id: null, area: '', sigla: '', unidade: '', departamento: '', participacao: '' }]);
    }

    function editar(indice, campo, valorCampo){
        setParceria((atuais) => atuais.map((l,i) => (i===indice ? {...l, [campo]: valorCampo } : l)));
    }
    
    async function excluir(indice){
        setParceria((atuais) => atuais.filter((_,i) => i !== indice));
    }


    return (
        <fieldset>
            <legend>
                Parcerias Internas
            </legend>

            <button type="button" className="btn btn-sm btn-primary mb-3" onClick={novaParceria}>
                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo
            </button>

            {parceria.map((parceria,i) => (
                <div key={parceria.id ?? `nova-${i}`}>
                    <div>{i+1}.</div>

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
                        value={form.area}
                        onChange={(e) => editar(i ,"area", e.target.value)}
                        />
                    </div>
                

                    <div className="mb-3">
                        <label className="form-label">Sigla da Intituição</label>
                        <input
                        type="text"
                        className="form-control"
                        value={form.sigla}
                        onChange={(e) => editar(i,"sigla", e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Unidade</label><br/>
                        <select
                            className="form-select"
                            value={form.unidade}
                            onChange={(e) => editar(i,"unidade", e.target.value)}
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
                            value={form.departamento}
                            onChange={(e) =>
                                editar(i,"departamento", e.target.value)
                            }
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
                        valor={form.participacao_interna}
                        aoMudar={atualizarCampo}
                    />
                
                </div>
            ))}


        </fieldset>
    );
}

export default ParceriasInternas;
